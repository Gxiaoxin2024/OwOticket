var express = require('express');
var router = express.Router();
var {rdb} = require('../db/db');

/**
 * GET /cart - 获取用户购物车数据
 * 根据account查询购物车
 */
router.get('/cart', (req, res) => {
  const account = req.query.account;
  
  if (!account) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: account'
    });
  }

  // 优化查询：先获取购物车ID，再获取商品项
  const getCartData = async () => {
    try {
      // 1. 获取购物车ID
      const carts = await rdb('SELECT id FROM carts WHERE account = ?', [account]);
      
      if (carts.length === 0) {
        return {
          id: null,
          account: account,
          Ticketing: [],
          Hotel: [],
          Souvenir: []
        };
      }
      
      const cartId = carts[0].id;
      
      // 2. 获取购物车商品项
      const items = await rdb(`
        SELECT 
          card_id, category, type, img, count, 
          scheduledTime, model, price
        FROM cart_items
        WHERE cart_id = ?
      `, [cartId]);
      
      // 3. 重组数据结构
      const result = {
        id: cartId,
        account: account,
        Ticketing: [],
        Hotel: [],
        Souvenir: []
      };
      
      items.forEach(item => {
        // 安全处理 model 字段
        let modelValue = null;
        try {
          if (item.model) {
            // 如果 model 是字符串，解析为 JSON
            if (typeof item.model === 'string') {
              modelValue = JSON.parse(item.model);
            } 
            // 如果已经是对象，直接使用
            else if (typeof item.model === 'object') {
              modelValue = item.model;
            }
          }
        } catch (e) {
          console.error('JSON 解析错误:', e);
        }
        
        const itemObj = {
          card_id: item.card_id,
          type: item.type,
          img: item.img,
          count: item.count,
          scheduledTime: item.scheduledTime,
          model: modelValue,
          price: item.price
        };
        
        // 按类别分组
        switch (item.category) {
          case 'Ticketing': 
            result.Ticketing.push(itemObj);
            break;
          case 'Hotel': 
            result.Hotel.push(itemObj);
            break;
          case 'Souvenir': 
            result.Souvenir.push(itemObj);
            break;
        }
      });
      
      return result;
      
    } catch (err) {
      throw err;
    }
  };
  
  // 执行并返回结果
  getCartData()
    .then(data => {
      res.send({
        code: 200,
        data: data
      });
    })
    .catch(err => {
      console.error('获取购物车数据失败:', err);
      res.status(500).send({
        code: 500,
        message: '获取购物车数据失败',
        error: err.message
      });
    });
});

/**
 * POST /cart - 添加商品到购物车
 * 根据account操作
 */
router.post('/cart', (req, res) => {
  const { account, item } = req.body;
  
  if (!account || !item) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: account 或 item'
    });
  }

  // 步骤1: 获取或创建购物车
  const getOrCreateCart = () => {
    return rdb('SELECT id FROM carts WHERE account = ?', [account])
      .then(carts => {
        if (carts.length > 0) return carts[0].id;
        return rdb('INSERT INTO carts (account) VALUES (?)', [account])
          .then(result => result.insertId);
      });
  };

  // 步骤2: 插入商品项
  getOrCreateCart()
    .then(cartId => {
      const { card_id, category, type, img, count, scheduledTime, model, price } = item;
      
      return rdb(`
        INSERT INTO cart_items (
          cart_id, card_id, category, type, img, count, 
          scheduledTime, model, price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cartId,
        card_id,
        category,
        type,
        img,
        count,
        scheduledTime,
        model ? JSON.stringify(model) : null,
        price
      ]);
    })
    .then(() => {
      res.send({
        code: 200,
        message: '商品添加成功'
      });
    })
    .catch(err => {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).send({
          code: 400,
          message: 'card_id 已存在'
        });
      } else {
        res.status(500).send({
          code: 500,
          message: '添加商品失败',
          error: err.message
        });
      }
    });
});

/**
 * PUT /cart - 修改购物车商品
 * 根据card_id修改
 */
router.put('/cart', (req, res) => {
  const { card_id, updates } = req.body;
  
  if (!card_id || !updates) {
    return res.status(400).send({
      code: 400,
      message: '缺少必要参数: card_id 或 updates'
    });
  }

  // 构建动态更新语句
  const fields = [];
  const values = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'model' && value !== null) {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else if (key !== 'card_id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) {
    return res.status(400).send({
      code: 400,
      message: '无有效更新字段'
    });
  }
  
  values.push(card_id);
  
  const query = `
    UPDATE cart_items 
    SET ${fields.join(', ')}
    WHERE card_id = ?
  `;

  rdb(query, values)
    .then(result => {
      if (result.affectedRows === 0) {
        return res.status(404).send({
          code: 404,
          message: '未找到指定card_id的商品'
        });
      }
      res.send({
        code: 200,
        message: '商品更新成功'
      });
    })
    .catch(err => {
      res.status(500).send({
        code: 500,
        message: '更新商品失败',
        error: err.message
      });
    });
});

/**
 * DELETE /cart - 删除购物车商品或用户所有购物车数据
 * 根据card_id删除单个商品，或根据account删除用户所有购物车数据
 */
router.delete('/cart', (req, res) => {
  const card_id = req.query.card_id;
  const account = req.query.account;

  // 如果提供了account参数，删除用户的所有购物车数据
  if (account) {
    deleteUserCartData(account)
      .then(result => {
        res.send({
          code: 200,
          message: result.message,
          data: {
            success: result.success,
            deletedCartId: result.deletedCartId
          }
        });
      })
      .catch(err => {
        console.error('删除用户购物车数据失败:', err);
        res.status(500).send({
          code: 500,
          message: '删除用户购物车数据失败',
          error: err.message
        });
      });
    return;
  }

  // 如果提供了card_id参数，删除单个商品
  if (card_id) {
    rdb('DELETE FROM cart_items WHERE card_id = ?', [card_id])
      .then(result => {
        if (result.affectedRows === 0) {
          return res.status(404).send({
            code: 404,
            message: '未找到指定card_id的商品'
          });
        }
        res.send({
          code: 200,
          message: '商品删除成功'
        });
      })
      .catch(err => {
        res.status(500).send({
          code: 500,
          message: '删除商品失败',
          error: err.message
        });
      });
    return;
  }

  // 如果既没有card_id也没有account参数
  return res.status(400).send({
    code: 400,
    message: '缺少必要参数: card_id 或 account'
  });
});

/**
 * 删除用户的所有购物车数据
 * 根据account删除carts表中的记录，同时删除对应cart_id的所有购物车商品
 * 这个函数供其他模块调用，不是路由
 */
const deleteUserCartData = async (account) => {
  try {
    // 1. 先获取该用户的购物车ID
    const carts = await rdb('SELECT id FROM carts WHERE account = ?', [account]);

    if (carts.length === 0) {
      // 用户没有购物车数据，直接返回成功
      return {
        success: true,
        message: '用户无购物车数据'
      };
    }

    const cartId = carts[0].id;

    // 2. 删除购物车商品项（cart_items表中cart_id对应的所有数据）
    await rdb('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    // 3. 删除购物车记录（carts表中account对应的记录）
    await rdb('DELETE FROM carts WHERE account = ?', [account]);

    return {
      success: true,
      message: '用户购物车数据删除成功',
      deletedCartId: cartId
    };

  } catch (error) {
    console.error('删除用户购物车数据失败:', error);
    throw error;
  }
};

// 导出删除购物车数据的函数，供其他模块使用
router.deleteUserCartData = deleteUserCartData;

module.exports = router;