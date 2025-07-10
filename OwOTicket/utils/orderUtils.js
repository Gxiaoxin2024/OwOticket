/**
 * 订单管理服务
 * 封装所有与订单相关的 API 调用
 *
 * 功能包括：
 * - 创建订单和添加商品
 * - 获取用户订单列表
 * - 删除订单项
 * - 修改订单状态 (NEW)
 * - 订单统计和筛选
 *
 * 订单状态说明：
 * - 0: 待付款
 * - 1: 待完成 (已付款)
 * - 2: 已完成
 *
 * 线上地址： http://121.36.249.12:3001
 * 本地测试地址： http://localhost:3000
 */
class OrderService {
  constructor(baseUrl = 'http://121.36.249.12:3001') {
    this.baseUrl = baseUrl;
    this.apiUrl = `${baseUrl}/order`;
  }

  /**
   * 测试后端连接
   * @returns {Promise<boolean>} 连接是否成功
   */
  async testConnection() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('后端连接测试失败:', error);
      return false;
    }
  }

  /**
   * 创建新订单或添加商品到现有订单
   * @param {string} account 用户账号
   * @param {Array} items 商品项数组
   * @param {string} items[].card_id 商品卡片ID
   * @param {string} items[].name 商品名称
   * @param {string} items[].img 商品图片
   * @param {number} items[].count 商品数量
   * @param {string} items[].scheduledTime 预定时间
   * @param {Object} [items[].model] 商品规格（可选）
   * @param {string} items[].price 商品价格
   * @param {number} [items[].status] 订单状态（可选，默认0）
   * @returns {Promise<Object>} 创建结果
   */
  async createOrder(account, items) {
    if (!account) {
      throw new Error('缺少必填参数: account');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('缺少必填参数: items 或 items 为空数组');
    }

    // 验证每个商品项的必填字段
    const requiredFields = ['card_id', 'name', 'img', 'count', 'scheduledTime', 'price'];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const missingFields = requiredFields.filter(field => !item[field] && item[field] !== 0);

      if (missingFields.length > 0) {
        console.error(`商品项 ${i + 1} 缺少必填参数:`, missingFields);
        throw new Error(`商品项 ${i + 1} 缺少必填参数: ${missingFields.join(', ')}`);
      }
    }

    try {
      const requestData = {
        account: account.trim(),
        items: items.map(item => {
          // 处理scheduledTime，确保是YYYY-MM-DD格式
          let scheduledTime = item.scheduledTime.toString().trim()

          // 如果是ISO时间戳格式，转换为日期格式
          if (scheduledTime.includes('T')) {
            scheduledTime = scheduledTime.split('T')[0]
          }

          // 验证日期格式是否为YYYY-MM-DD
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/
          if (!dateRegex.test(scheduledTime)) {
            console.warn('日期格式不正确，使用当前日期:', scheduledTime)
            scheduledTime = new Date().toISOString().split('T')[0]
          }

          // 处理model字段 - 参考购物车的处理方式
          // 如果model是对象（纪念品），转换为JSON字符串以避免后端序列化问题
          let processedModel = item.model
          if (item.model && typeof item.model === 'object') {
            processedModel = JSON.stringify(item.model)
          }

          return {
            card_id: item.card_id.toString(),
            name: item.name.trim(),
            img: item.img.trim(),
            count: Number(item.count) || 1,
            scheduledTime: scheduledTime,
            model: processedModel,
            price: item.price.toString(),
            status: Number(item.status) || 0
          }
        })
      };


      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.code !== 200) {
        console.error('创建订单失败 - 后端错误:', result);
        throw new Error(result.message || '创建订单失败');
      }

      return result;
    } catch (error) {
      console.error('创建订单失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * 获取用户订单列表
   * @param {string} account 用户账号
   * @returns {Promise<Array>} 订单列表，每个订单包含订单项数组
   */
  async getUserOrders(account) {
    if (!account) {
      throw new Error('缺少必填参数: account');
    }

    try {
      const response = await fetch(`${this.apiUrl}?account=${encodeURIComponent(account)}`);
      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '获取订单列表失败');
      }

      // 处理返回的数据，将model字段从JSON字符串转换回对象（参考购物车的处理方式）
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              // 如果model是字符串，尝试解析为对象（纪念品的规格信息）
              if (item.model && typeof item.model === 'string') {
                try {
                  item.model = JSON.parse(item.model);
                } catch (e) {
                  // 解析失败时保持为null，避免显示错误
                  console.warn('无法解析model字段:', item.model, e);
                  item.model = null;
                }
              }
            });
          }
        });
      }

      return result.data;
    } catch (error) {
      console.error('获取订单列表失败:', error);
      throw error;
    }
  }

  /**
   * 删除订单中的单个商品项
   * @param {string} cardId 商品卡片ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteOrderItem(cardId) {
    if (!cardId) {
      throw new Error('缺少必填参数: cardId');
    }

    try {
      const response = await fetch(`${this.apiUrl}?card_id=${encodeURIComponent(cardId)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '删除商品项失败');
      }

      return result;
    } catch (error) {
      console.error('删除商品项失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户的所有订单数据
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUserAllOrders(account) {
    if (!account) {
      throw new Error('缺少必填参数: account');
    }

    try {
      const response = await fetch(`${this.apiUrl}?account=${encodeURIComponent(account)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '删除用户所有订单数据失败');
      }

      return result;
    } catch (error) {
      console.error('删除用户所有订单数据失败:', error);
      throw error;
    }
  }

  /**
   * 添加单个商品到订单
   * @param {string} account 用户账号
   * @param {Object} item 商品项
   * @returns {Promise<Object>} 添加结果
   */
  async addItemToOrder(account, item) {
    return await this.createOrder(account, [item]);
  }

  /**
   * 批量添加商品到订单
   * @param {string} account 用户账号
   * @param {Array} items 商品项数组
   * @returns {Promise<Object>} 添加结果
   */
  async addItemsToOrder(account, items) {
    return await this.createOrder(account, items);
  }

  /**
   * 检查用户是否有订单
   * @param {string} account 用户账号
   * @returns {Promise<boolean>} 是否有订单
   */
  async hasOrders(account) {
    try {
      const orders = await this.getUserOrders(account);
      return orders.length > 0;
    } catch (error) {
      console.errorz('检查用户订单失败:', error);
      return false;
    }
  }

  /**
   * 获取用户订单统计信息
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 统计信息
   */
  async getOrderStats(account) {
    try {
      const orders = await this.getUserOrders(account);

      let totalItems = 0;
      let totalAmount = 0;
      let pendingItems = 0;
      let completedItems = 0;

      orders.forEach(order => {
        order.items.forEach(item => {
          totalItems += item.count;
          totalAmount += parseFloat(item.price) * item.count;

          if (item.status === 0) {
            pendingItems += item.count;
          } else if (item.status === 1) {
            completedItems += item.count;
          }
        });
      });

      return {
        orderCount: orders.length,
        totalItems,
        totalAmount: totalAmount.toFixed(2),
        pendingItems,
        completedItems
      };
    } catch (error) {
      console.error('获取订单统计失败:', error);
      throw error;
    }
  }

  /**
   * 更新订单项数量
   * @param {string} account 用户账号
   * @param {string} cardId 商品卡片ID
   * @param {number} newCount 新数量
   * @returns {Promise<Object>} 更新结果
   */
  async updateItemCount(account, cardId, newCount) {
    if (newCount <= 0) {
      // 如果数量为0或负数，删除该商品项
      return await this.deleteOrderItem(cardId);
    }

    try {
      // 先获取当前订单项信息
      const orders = await this.getUserOrders(account);
      let targetItem = null;

      for (const order of orders) {
        const item = order.items.find(item => item.card_id === cardId);
        if (item) {
          targetItem = item;
          break;
        }
      }

      if (!targetItem) {
        throw new Error('未找到指定的订单项');
      }

      // 删除原有项
      await this.deleteOrderItem(cardId);

      // 重新添加新数量的项
      const updatedItem = {
        ...targetItem,
        count: newCount
      };

      return await this.addItemToOrder(account, updatedItem);
    } catch (error) {
      console.error('更新订单项数量失败:', error);
      throw error;
    }
  }

  /**
   * 清空用户所有订单
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 清空结果
   */
  async clearUserOrders(account) {
    try {
      const orders = await this.getUserOrders(account);
      const deletePromises = [];

      orders.forEach(order => {
        order.items.forEach(item => {
          deletePromises.push(this.deleteOrderItem(item.card_id));
        });
      });

      await Promise.all(deletePromises);

      return {
        code: 200,
        message: '订单清空成功',
        data: {
          deletedOrdersCount: orders.length,
          deletedItemsCount: deletePromises.length
        }
      };
    } catch (error) {
      console.error('清空用户订单失败:', error);
      throw error;
    }
  }

  /**
   * 根据商品类型获取订单项
   * @param {string} account 用户账号
   * @param {string} category 商品类型 (Ticketing, Hotel, Souvenir)
   * @returns {Promise<Array>} 指定类型的订单项
   */
  async getOrderItemsByCategory(account, category) {
    try {
      const orders = await this.getUserOrders(account);
      const categoryItems = [];

      orders.forEach(order => {
        order.items.forEach(item => {
          // 根据商品名称或其他字段判断类型
          // 这里可以根据实际业务逻辑调整判断条件
          if (this.getCategoryByItemName(item.name) === category) {
            categoryItems.push(item);
          }
        });
      });

      return categoryItems;
    } catch (error) {
      console.error('获取分类订单项失败:', error);
      throw error;
    }
  }

  /**
   * 修改订单项状态
   * @param {string} cardId 商品卡片ID
   * @param {number} status 新状态 (0: 待付款, 1: 待完成, 2: 已完成)
   * @returns {Promise<Object>} 修改结果
   */
  async updateOrderStatus(cardId, status) {
    if (!cardId) {
      throw new Error('缺少必填参数: cardId');
    }

    if (status === undefined || status === null) {
      throw new Error('缺少必填参数: status');
    }

    // 验证status值的有效性
    const validStatuses = [0, 1, 2];
    const numericStatus = Number(status);

    if (!validStatuses.includes(numericStatus)) {
      throw new Error('status参数无效，只允许0(待付款)、1(待完成)或2(已完成)');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_id: cardId.toString(),
          status: numericStatus
        })
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '修改订单状态失败');
      }

      return result;
    } catch (error) {
      console.error('修改订单状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取状态文本描述
   * @param {number} status 状态值
   * @returns {string} 状态文本
   */
  getStatusText(status) {
    switch (Number(status)) {
      case 0: return '待付款';
      case 1: return '待完成';
      case 2: return '已完成';
      default: return '未知状态';
    }
  }

  /**
   * 根据状态筛选订单项
   * @param {string} account 用户账号
   * @param {number} status 状态值 (0: 待付款, 1: 待完成, 2: 已完成)
   * @returns {Promise<Array>} 指定状态的订单项
   */
  async getOrderItemsByStatus(account, status) {
    if (!account) {
      throw new Error('缺少必填参数: account');
    }

    if (status === undefined || status === null) {
      throw new Error('缺少必填参数: status');
    }

    try {
      const orders = await this.getUserOrders(account);
      const statusItems = [];

      orders.forEach(order => {
        order.items.forEach(item => {
          if (Number(item.status) === Number(status)) {
            statusItems.push({
              ...item,
              statusText: this.getStatusText(item.status)
            });
          }
        });
      });

      return statusItems;
    } catch (error) {
      console.error('根据状态获取订单项失败:', error);
      throw error;
    }
  }

  /**
   * 根据商品名称判断类型（辅助方法）
   * @param {string} itemName 商品名称
   * @returns {string} 商品类型
   */
  getCategoryByItemName(itemName) {
    if (itemName.includes('门票') || itemName.includes('票')) {
      return 'Ticketing';
    } else if (itemName.includes('房') || itemName.includes('住宿') || itemName.includes('旅社')) {
      return 'Hotel';
    } else {
      return 'Souvenir';
    }
  }
}

// 创建默认实例
const orderService = new OrderService();

// 如果在浏览器环境中，将服务挂载到全局对象
if (typeof window !== 'undefined') {
  window.orderService = orderService;
}

// 如果使用 ES 模块，可以导出
export default orderService;
