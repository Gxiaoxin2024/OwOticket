/**
 * 简化版订单服务
 * 专门为前端常用场景设计的轻量级订单API封装
 */
class SimpleOrderService {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.orderUrl = `${baseUrl}/order`;
  }

  /**
   * 快速创建订单
   * @param {string} account 用户账号
   * @param {Array} items 商品列表
   * @param {Object} options 选项
   * @returns {Promise<Object>} 创建结果
   */
  async quickOrder(account, items, options = {}) {
    const {
      autoMerge = true,        // 自动合并重复商品
      removeFromCart = false,  // 是否从购物车移除
      validateFirst = true     // 是否先验证数据
    } = options;

    // 数据验证
    if (validateFirst) {
      this._validateQuickOrder(account, items);
    }

    // 构建订单数据
    const orderData = {
      account,
      items: this._formatItems(items),
      removeFromCart
    };

    try {
      // 根据选项选择创建方式
      const url = autoMerge ? `${this.orderUrl}/smart` : this.orderUrl;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '创建订单失败');
      }

      return this._formatOrderResult(result);
    } catch (error) {
      throw new Error(`订单创建失败: ${error.message}`);
    }
  }

  /**
   * 获取我的订单
   * @param {string} account 用户账号
   * @param {Object} filters 筛选条件
   * @returns {Promise<Array>} 订单列表
   */
  async getMyOrders(account, filters = {}) {
    if (!account) {
      throw new Error('用户账号不能为空');
    }

    try {
      const response = await fetch(`${this.orderUrl}?account=${encodeURIComponent(account)}`);
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '获取订单失败');
      }

      let orders = result.data || [];

      // 应用筛选条件
      if (filters.status !== undefined) {
        orders = orders.filter(order => 
          order.items && order.items.some(item => item.status === filters.status)
        );
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        orders = orders.filter(order =>
          order.items && order.items.some(item => 
            item.name && item.name.toLowerCase().includes(keyword)
          )
        );
      }

      return orders.map(order => this._formatOrder(order));
    } catch (error) {
      throw new Error(`获取订单失败: ${error.message}`);
    }
  }

  /**
   * 支付订单（更新状态为已完成）
   * @param {string} cardId 商品ID
   * @returns {Promise<Object>} 支付结果
   */
  async payOrder(cardId) {
    if (!cardId) {
      throw new Error('商品ID不能为空');
    }

    try {
      const response = await fetch(this.orderUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: cardId,
          status: 1 // 1表示已完成
        })
      });

      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '支付失败');
      }

      return {
        success: true,
        message: '支付成功',
        cardId
      };
    } catch (error) {
      throw new Error(`支付失败: ${error.message}`);
    }
  }

  /**
   * 取消订单项
   * @param {string} cardId 商品ID
   * @param {string} orderId 订单ID（可选）
   * @returns {Promise<Object>} 取消结果
   */
  async cancelOrderItem(cardId, orderId = null) {
    if (!cardId) {
      throw new Error('商品ID不能为空');
    }

    try {
      let url = `${this.orderUrl}?card_id=${encodeURIComponent(cardId)}`;
      if (orderId) {
        url += `&order_id=${encodeURIComponent(orderId)}`;
      }

      const response = await fetch(url, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '取消订单项失败');
      }

      return {
        success: true,
        message: '订单项已取消',
        cardId
      };
    } catch (error) {
      throw new Error(`取消订单项失败: ${error.message}`);
    }
  }

  /**
   * 从购物车下单
   * @param {string} account 用户账号
   * @param {Array} cartItems 购物车商品
   * @returns {Promise<Object>} 下单结果
   */
  async orderFromCart(account, cartItems) {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('购物车为空');
    }

    // 转换购物车格式
    const orderItems = cartItems.map(item => ({
      card_id: item.card_id,
      name: item.type || item.name,
      img: item.img,
      count: item.count,
      scheduledTime: item.scheduledTime,
      model: item.model,
      price: item.price
    }));

    return await this.quickOrder(account, orderItems, {
      autoMerge: true,
      removeFromCart: true
    });
  }

  /**
   * 获取订单摘要
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 订单摘要
   */
  async getOrderSummary(account) {
    try {
      const orders = await this.getMyOrders(account);
      
      const summary = {
        total: orders.length,
        pending: 0,
        completed: 0,
        totalAmount: 0,
        totalItems: 0
      };

      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            summary.totalItems += item.count || 0;
            summary.totalAmount += (item.price || 0) * (item.count || 0);
            
            if (item.status === 0) {
              summary.pending++;
            } else if (item.status === 1) {
              summary.completed++;
            }
          });
        }
      });

      return summary;
    } catch (error) {
      throw new Error(`获取订单摘要失败: ${error.message}`);
    }
  }

  // 私有方法：验证快速下单数据
  _validateQuickOrder(account, items) {
    if (!account || typeof account !== 'string') {
      throw new Error('用户账号必须是非空字符串');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('商品列表不能为空');
    }

    items.forEach((item, index) => {
      if (!item.card_id) {
        throw new Error(`商品${index + 1}: 缺少商品ID`);
      }
      if (!item.name) {
        throw new Error(`商品${index + 1}: 缺少商品名称`);
      }
      if (!item.count || item.count <= 0) {
        throw new Error(`商品${index + 1}: 数量必须大于0`);
      }
      if (item.price === undefined || item.price < 0) {
        throw new Error(`商品${index + 1}: 价格不能为负数`);
      }
    });
  }

  // 私有方法：格式化商品数据
  _formatItems(items) {
    return items.map(item => ({
      card_id: String(item.card_id),
      name: String(item.name),
      img: item.img || null,
      count: Number(item.count),
      scheduledTime: item.scheduledTime || null,
      model: item.model || null,
      price: Number(item.price)
    }));
  }

  // 私有方法：格式化订单结果
  _formatOrderResult(result) {
    return {
      success: true,
      orderId: result.data.order_id,
      itemCount: result.data.item_count || result.data.processed_item_count,
      totalAmount: result.data.total_amount,
      message: result.message,
      createdAt: result.data.created_at
    };
  }

  // 私有方法：格式化订单数据
  _formatOrder(order) {
    return {
      id: order.id,
      account: order.account,
      createdAt: order.created_at,
      items: (order.items || []).map(item => ({
        id: item.id,
        cardId: item.card_id,
        name: item.name,
        img: item.img,
        count: item.count,
        price: item.price,
        status: item.status,
        statusText: item.status === 0 ? '待付款' : '已完成',
        scheduledTime: item.scheduledTime,
        model: item.model,
        totalPrice: (item.price || 0) * (item.count || 0)
      })),
      totalAmount: (order.items || []).reduce((sum, item) => 
        sum + (item.price || 0) * (item.count || 0), 0
      ),
      totalItems: (order.items || []).reduce((sum, item) => 
        sum + (item.count || 0), 0
      )
    };
  }
}

// 创建默认实例
const simpleOrderService = new SimpleOrderService();

// 浏览器环境挂载到全局
if (typeof window !== 'undefined') {
  window.simpleOrderService = simpleOrderService;
}

// ES模块导出
export default simpleOrderService;
