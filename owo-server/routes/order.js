var express = require('express');
var router = express.Router();
var {rdb} = require('../db/db');

// 需要从 db.js 中获取连接池
const { pool } = require('../db/db'); // 需要修改 db.js 导出连接池

/**
 * POST /order - 创建新订单
 * 使用事务确保数据一致性
 */
router.post('/', async (req, res) => {
  const { account, items } = req.body;
  
  if (!account || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: account 或 items'
    });
  }

  // 获取数据库连接
  const connection = await pool.getConnection();
  
  try {
    // 开始事务
    await connection.beginTransaction();

    // 1. 获取或创建订单
    let orderId;
    
    // 查询账号是否已有订单
    const [existingOrders] = await connection.query(
      'SELECT id FROM orders WHERE account = ?',
      [account]
    );
    
    if (existingOrders.length > 0) {
      // 使用现有订单
      orderId = existingOrders[0].id;
    } else {
      // 创建新订单
      const [orderResult] = await connection.query(
        'INSERT INTO orders (account) VALUES (?)',
        [account]
      );
      orderId = orderResult.insertId;
    }

    // 2. 添加商品项到订单
    for (const item of items) {
      // 检查商品项是否已存在
      const [existingItems] = await connection.query(
        'SELECT id FROM order_items WHERE order_id = ? AND card_id = ?',
        [orderId, item.card_id]
      );
      
      if (existingItems.length > 0) {
        // 商品项已存在，更新数量
        await connection.query(
          'UPDATE order_items SET count = count + ? WHERE id = ?',
          [item.count, existingItems[0].id]
        );
      } else {
        // 插入新商品项
        await connection.query(
          `INSERT INTO order_items (
            order_id, card_id, name, img, count, 
            scheduledTime, model, price, payTime, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.card_id,
            item.name,
            item.img,
            item.count,
            item.scheduledTime,
            item.model ? JSON.stringify(item.model) : null,
            item.price,
            item.payTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
            item.status || 0
          ]
        );
      }
    }

    // 提交事务
    await connection.commit();
    
    res.send({
      code: 200,
      message: '商品项添加成功',
      data: { 
        orderId,
        action: existingOrders.length > 0 ? '添加到现有订单' : '创建新订单'
      }
    });

  } catch (err) {
    // 回滚事务
    await connection.rollback();
    
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).send({
        code: 400,
        message: 'card_id 已存在'
      });
    } else {
      console.error('添加商品项失败:', err);
      res.status(500).send({
        code: 500,
        message: '添加商品项失败',
        error: err.message
      });
    }
  } finally {
    // 释放连接
    connection.release();
  }
});
/**
 * GET /order - 查询用户订单
 * 根据account查询用户所有订单及订单项
 */
router.get('/', async (req, res) => {
  const account = req.query.account;
  
  if (!account) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: account'
    });
  }

  try {
    // 1. 获取用户所有订单
    const orders = await rdb(
      'SELECT id, account FROM orders WHERE account = ?',
      [account]
    );

    if (orders.length === 0) {
      return res.send({
        code: 200,
        data: []
      });
    }

    // 2. 获取所有订单的商品项
    const orderIds = orders.map(o => o.id);
    const items = await rdb(
      `SELECT 
        id, order_id, card_id, name, img, count, 
        scheduledTime, model, price, payTime, status
      FROM order_items 
      WHERE order_id IN (?)`,
      [orderIds]
    );

    // 3. 重组数据结构：订单包含订单项数组
    const ordersWithItems = orders.map(order => {
      const orderItems = items
        .filter(item => item.order_id === order.id)
        .map(item => ({
          id: item.id,
          card_id: item.card_id,
          name: item.name,
          img: item.img,
          count: item.count,
          scheduledTime: item.scheduledTime,
          model: item.model ? JSON.parse(item.model) : null,
          price: item.price,
          payTime: item.payTime,
          status: item.status
        }));
      
      return {
        id: order.id,
        account: order.account,
        items: orderItems
      };
    });

    res.send({
      code: 200,
      data: ordersWithItems
    });

  } catch (err) {
    console.error('查询订单失败:', err);
    res.status(500).send({
      code: 500,
      message: '查询订单失败',
      error: err.message
    });
  }
});

/**
 * DELETE /order - 删除订单中的单个商品项或删除用户的所有订单
 * 根据card_id删除单个商品项，或根据account删除用户所有订单数据
 */
router.delete('/', async (req, res) => {
  const card_id = req.query.card_id;
  const account = req.query.account;

  // 如果提供了account参数，删除用户的所有订单数据
  if (account) {
    try {
      const result = await deleteUserAllOrders(account);
      res.send({
        code: 200,
        message: result.message,
        data: {
          success: result.success,
          deletedOrdersCount: result.deletedOrdersCount,
          deletedItemsCount: result.deletedItemsCount
        }
      });
    } catch (err) {
      console.error('删除用户所有订单失败:', err);
      res.status(500).send({
        code: 500,
        message: '删除用户所有订单失败',
        error: err.message
      });
    }
    return;
  }

  // 如果提供了card_id参数，删除单个商品项
  if (!card_id) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: card_id 或 account'
    });
  }

  // 获取数据库连接
  const connection = await pool.getConnection();
  
  try {
    // 开始事务
    await connection.beginTransaction();

    // 1. 获取要删除的商品项信息（包含所属订单ID）
    const [items] = await connection.query(
      'SELECT order_id FROM order_items WHERE card_id = ?',
      [card_id]
    );
    
    if (items.length === 0) {
      throw new Error('未找到指定card_id的商品项');
    }
    
    const orderId = items[0].order_id;

    // 2. 删除商品项
    const [deleteResult] = await connection.query(
      'DELETE FROM order_items WHERE card_id = ?',
      [card_id]
    );
    
    if (deleteResult.affectedRows === 0) {
      throw new Error('删除商品项失败');
    }

    // 3. 检查订单是否为空（可选：删除空订单）
    const [remainingItems] = await connection.query(
      'SELECT COUNT(*) AS itemCount FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    if (remainingItems[0].itemCount === 0) {
      // 如果订单中没有其他商品项，删除整个订单
      await connection.query(
        'DELETE FROM orders WHERE id = ?',
        [orderId]
      );
    }

    // 提交事务
    await connection.commit();
    
    res.send({
      code: 200,
      message: '商品项删除成功',
      data: {
        deletedCardId: card_id,
        orderId: orderId,
        orderDeleted: remainingItems[0].itemCount === 0
      }
    });

  } catch (err) {
    // 回滚事务
    await connection.rollback();
    
    if (err.message.includes('未找到')) {
      res.status(404).send({
        code: 404,
        message: err.message
      });
    } else {
      console.error('删除商品项失败:', err);
      res.status(500).send({
        code: 500,
        message: '删除商品项失败',
        error: err.message
      });
    }
  } finally {
    // 释放连接
    connection.release();
  }
});

/**
 * PUT /order - 修改订单项状态
 * 根据card_id修改订单项的status属性
 */
router.put('/', async (req, res) => {
  const { card_id, status } = req.body;

  // 参数验证
  if (!card_id) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: card_id'
    });
  }

  if (status === undefined || status === null) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: status'
    });
  }

  // 验证status值的有效性
  if (![0, 1, 2].includes(Number(status))) {
    return res.status(400).send({
      code: 400,
      message: 'status参数无效，只允许0(待付款)、1(待完成)或2(已完成)'
    });
  }

  try {
    // 执行更新操作
    const result = await rdb(
      'UPDATE order_items SET status = ? WHERE card_id = ?',
      [Number(status), card_id]
    );

    // 检查是否找到并更新了记录
    if (result.affectedRows === 0) {
      return res.status(404).send({
        code: 404,
        message: '未找到指定card_id的订单项'
      });
    }

    // 获取状态文本
    const getStatusText = (statusValue) => {
      switch (Number(statusValue)) {
        case 0: return '待付款';
        case 1: return '待完成';
        case 2: return '已完成';
        default: return '未知状态';
      }
    };

    // 返回成功结果
    res.send({
      code: 200,
      message: '订单状态修改成功',
      data: {
        card_id: card_id,
        new_status: Number(status),
        status_text: getStatusText(status),
        affected_rows: result.affectedRows,
        updated_at: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('修改订单状态失败:', err);
    res.status(500).send({
      code: 500,
      message: '修改订单状态失败',
      error: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
    });
  }
});

/**
 * 删除用户的所有订单数据
 * 根据account删除orders表中的记录，同时删除对应order_id的所有订单商品项
 * 这个函数供路由调用，使用事务确保数据一致性
 */
const deleteUserAllOrders = async (account) => {
  // 获取数据库连接
  const connection = await pool.getConnection();

  try {
    // 开始事务
    await connection.beginTransaction();

    // 1. 先获取该用户的所有订单ID
    const [orders] = await connection.query(
      'SELECT id FROM orders WHERE account = ?',
      [account]
    );

    if (orders.length === 0) {
      // 用户没有订单数据，直接返回成功
      await connection.commit();
      return {
        success: true,
        message: '用户无订单数据',
        deletedOrdersCount: 0,
        deletedItemsCount: 0
      };
    }

    const orderIds = orders.map(order => order.id);

    // 2. 删除所有订单商品项（order_items表中order_id对应的所有数据）
    let deletedItemsCount = 0;
    if (orderIds.length > 0) {
      const [itemsDeleteResult] = await connection.query(
        `DELETE FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
      deletedItemsCount = itemsDeleteResult.affectedRows;
    }

    // 3. 删除订单记录（orders表中account对应的所有记录）
    const [ordersDeleteResult] = await connection.query(
      'DELETE FROM orders WHERE account = ?',
      [account]
    );

    // 提交事务
    await connection.commit();

    return {
      success: true,
      message: '用户所有订单数据删除成功',
      deletedOrdersCount: ordersDeleteResult.affectedRows,
      deletedItemsCount: deletedItemsCount
    };

  } catch (error) {
    // 回滚事务
    await connection.rollback();
    console.error('删除用户所有订单数据失败:', error);
    throw error;
  } finally {
    // 释放连接
    connection.release();
  }
};

module.exports = router;