/**
 * 购物车服务
 * 封装所有与购物车相关的 API 调用
 * 线上地址： http://121.36.249.12:3001
 * 本地测试地址： http://localhost:3000
 */
class CartService {
  constructor(baseUrl = 'http://121.36.249.12:3001') {
    this.baseUrl = baseUrl;
    this.apiUrl = `${baseUrl}/common/cart`;
  }

  /**
   * 获取用户购物车数据
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 购物车数据，包含 Ticketing、Hotel、Souvenir 三个分类
   */
  async getCart(account) {
    if (!account) {
      throw new Error('缺少必要参数: account');
    }

    try {
      const response = await fetch(`${this.apiUrl}?account=${encodeURIComponent(account)}`);
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '获取购物车数据失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取购物车数据失败:', error);
      throw error;
    }
  }

  /**
   * 添加商品到购物车
   * @param {string} account 用户账号
   * @param {Object} item 商品信息
   * @param {string} item.card_id 商品ID 
   * @param {string} item.category 商品类别 (Ticketing/Hotel/Souvenir)
   * @param {string} item.type 商品类型
   * @param {string} item.img 商品图片
   * @param {number} item.count 商品数量
   * @param {string} [item.scheduledTime] 预定时间 (可选)
   * @param {Object} [item.model] 商品模型数据 (可选)
   * @param {number} item.price 商品价格
   * @returns {Promise<Object>} 添加结果
   */
  async addToCart(account, item) {
    if (!account || !item) {
      throw new Error('缺少必要参数: account 或 item');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account, item })
      });
      
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '添加商品到购物车失败');
      }
      
      return result;
    } catch (error) {
      console.error('添加商品到购物车失败:', error);
      throw error;
    }
  }

  /**
   * 更新购物车商品
   * @param {string} card_id 商品ID
   * @param {Object} updates 更新内容
   * @param {number} [updates.count] 更新商品数量
   * @param {string} [updates.scheduledTime] 更新预定时间
   * @param {Object} [updates.model] 更新商品模型数据
   * @param {number} [updates.price] 更新商品价格
   * @returns {Promise<Object>} 更新结果
   */
  async updateCartItem(card_id, updates) {
    if (!card_id || !updates) {
      throw new Error('缺少必要参数: card_id 或 updates');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ card_id, updates })
      });
      
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '更新购物车商品失败');
      }
      
      return result;
    } catch (error) {
      console.error('更新购物车商品失败:', error);
      throw error;
    }
  }

  /**
   * 从购物车删除商品
   * @param {string} card_id 商品ID
   * @returns {Promise<Object>} 删除结果
   */
  async removeFromCart(card_id) {
    if (!card_id) {
      throw new Error('缺少必要参数: card_id');
    }

    try {
      const response = await fetch(`${this.apiUrl}?card_id=${encodeURIComponent(card_id)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '从购物车删除商品失败');
      }

      return result;
    } catch (error) {
      console.error('从购物车删除商品失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户的所有购物车数据
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUserCartData(account) {
    if (!account) {
      throw new Error('缺少必要参数: account');
    }

    try {
      const response = await fetch(`${this.apiUrl}?account=${encodeURIComponent(account)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '删除用户购物车数据失败');
      }

      return result;
    } catch (error) {
      console.error('删除用户购物车数据失败:', error);
      throw error;
    }
  }

  /**
   * 计算购物车总价
   * @param {Object} cartData 购物车数据
   * @returns {number} 总价
   */
  calculateTotal(cartData) {
    if (!cartData) return 0;
    
    let total = 0;
    
    // 计算门票总价
    if (cartData.Ticketing && cartData.Ticketing.length > 0) {
      cartData.Ticketing.forEach(item => {
        total += (item.price || 0) * (item.count || 1);
      });
    }
    
    // 计算酒店总价
    if (cartData.Hotel && cartData.Hotel.length > 0) {
      cartData.Hotel.forEach(item => {
        total += (item.price || 0) * (item.count || 1);
      });
    }
    
    // 计算纪念品总价
    if (cartData.Souvenir && cartData.Souvenir.length > 0) {
      cartData.Souvenir.forEach(item => {
        total += (item.price || 0) * (item.count || 1);
      });
    }
    
    return total;
  }

  /**
   * 获取购物车商品总数
   * @param {Object} cartData 购物车数据
   * @returns {number} 商品总数
   */
  getItemCount(cartData) {
    if (!cartData) return 0;

    let count = 0;

    if (cartData.Ticketing) count += cartData.Ticketing.length;
    if (cartData.Hotel) count += cartData.Hotel.length;
    if (cartData.Souvenir) count += cartData.Souvenir.length;

    return count;
  }
}

// 创建默认实例
const cartService = new CartService();

// 如果在浏览器环境中，将服务挂载到全局对象
if (typeof window !== 'undefined') {
  window.cartService = cartService;
}

// 如果使用 ES 模块，可以导出
export default cartService;