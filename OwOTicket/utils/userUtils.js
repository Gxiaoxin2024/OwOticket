/**
 * 用户管理服务
 * 封装所有与用户相关的 API 调用 localhost
 * 线上地址： http://121.36.249.12:3001
 * 本地测试地址： http://localhost:3000
 */
class UserService {
  constructor(baseUrl = 'http://121.36.249.12:3001') {
    this.baseUrl = baseUrl;
    this.apiUrl = `${baseUrl}/admin/user`;
    this.authUrl = `${baseUrl}/auth`;
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
      console.error('后端连接测试失败:', error)
      return false;
    }
  }

  /**
   * 获取所有用户列表
   * @returns {Promise<Array>} 用户列表
   */
  async getAllUsers() {
    try {
      const response = await fetch(this.apiUrl);
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '获取用户列表失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据账号获取用户信息
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 用户信息
   */
  async getUserByAccount(account) {
    try {
      const response = await fetch(`${this.apiUrl}/detail?account=${encodeURIComponent(account)}`);

      // 检查响应是否为JSON格式
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API端点不存在或返回非JSON数据');
      }

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '获取用户信息失败');
      }

      return result.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 创建新用户
   * @param {Object} userData 用户数据
   * @param {string} userData.name 用户名 (必填)
   * @param {string} userData.account 账号 (必填)
   * @param {string} userData.phone 手机号 (必填)
   * @param {string} userData.password 密码 (必填)
   * @param {number} [userData.clubDays] 会员天数 (可选)
   * @param {number} [userData.points] 积分 (可选)
   * @param {number} [userData.likes] 点赞数 (可选)
   * @param {number} [userData.coupons] 优惠券数 (可选)
   * @param {number} [userData.footprints] 足迹数 (可选)
   * @param {number} [userData.isAdmin=0] 是否管理员 (可选)
   * @param {string} [userData.img] 头像 (可选)
   * @returns {Promise<Object>} 创建结果
   */
  async createUser(userData) {
    // 验证必填字段
    const requiredFields = ['name', 'account', 'phone', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field] || !userData[field].toString().trim());

    if (missingFields.length > 0) {
      throw new Error(`缺少必填参数: ${missingFields.join(', ')}`);
    }

    try {
      // 构建发送到后端的数据，只包含有值的字段
      const requestData = {
        name: userData.name.trim(),
        account: userData.account.trim(),
        phone: userData.phone.trim(),
        password: userData.password.trim()
      };

      // 添加可选字段（只有当字段有值时才添加）
      if (userData.clubDays !== undefined && userData.clubDays !== null) {
        requestData.clubDays = Number(userData.clubDays) || 0;
      }
      if (userData.points !== undefined && userData.points !== null) {
        requestData.points = Number(userData.points) || 0;
      }
      if (userData.likes !== undefined && userData.likes !== null) {
        requestData.likes = Number(userData.likes) || 0;
      }
      if (userData.coupons !== undefined && userData.coupons !== null) {
        requestData.coupons = Number(userData.coupons) || 0;
      }
      if (userData.footprints !== undefined && userData.footprints !== null) {
        requestData.footprints = Number(userData.footprints) || 0;
      }
      if (userData.isAdmin !== undefined && userData.isAdmin !== null) {
        requestData.isAdmin = Number(userData.isAdmin) || 0;
      }
      if (userData.img && userData.img.trim()) {
        requestData.img = userData.img.trim();
      }

      console.log('创建用户请求数据:', requestData);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '创建用户失败');
      }

      return result;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param {Object} userData 用户数据
   * @param {string} userData.account 账号 (必填，用于标识用户)
   * @param {string} [userData.name] 用户名
   * @param {string} [userData.phone] 手机号
   * @param {string} [userData.password] 密码
   * @param {string} [userData.img] 头像
   * @param {number} [userData.clubDays] 会员天数
   * @param {number} [userData.points] 积分
   * @param {number} [userData.likes] 点赞数
   * @param {number} [userData.coupons] 优惠券数
   * @param {number} [userData.footprints] 足迹数
   * @param {number} [userData.isAdmin] 管理员权限 (0: 普通用户, 1: 管理员)
   * @returns {Promise<Object>} 更新结果
   */
  async updateUser(userData) {
    if (!userData.account) {
      throw new Error('缺少必填参数: account');
    }
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || '更新用户信息失败');
      }
      
      return result;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户
   * @param {string} account 用户账号
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUser(account) {
    if (!account) {
      throw new Error('缺少必填参数: account');
    }

    try {
      const response = await fetch(`${this.apiUrl}?account=${encodeURIComponent(account)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '删除用户失败');
      }

      return result;
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
    }
  }

  /**
   * 用户登录验证
   * @param {string} account 账号或手机号
   * @param {string} password 密码
   * @returns {Promise<Object>} 登录结果，包含用户信息
   */
  async loginUser(account, password) {
    if (!account || !password) {
      throw new Error('账号和密码不能为空');
    }

    try {
      console.log('发送登录请求到:', `${this.authUrl}/login`)

      const response = await fetch(`${this.authUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ account, password })
      });

      console.log('登录响应状态:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('登录响应数据:', result)

      if (result.code !== 200) {
        throw new Error(result.message || '登录失败');
      }

      return result;
    } catch (error) {
      console.error('登录API调用失败:', error);

      // 如果是网络错误，提供更具体的错误信息
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('无法连接到服务器，请检查网络连接');
      }

      throw error;
    }
  }

  /**
   * 用户注册
   * @param {Object} userData 注册数据
   * @param {string} userData.account 账号
   * @param {string} userData.phone 手机号
   * @param {string} userData.password 密码
   * @param {string} [userData.name] 用户名（可选，不传则自动生成）
   * @returns {Promise<Object>} 注册结果
   */
  async registerUser(userData) {
    const { account, phone, password, name } = userData;

    if (!account || !phone || !password) {
      throw new Error('注册信息不完整');
    }

    try {
      // 构建注册数据
      const registerData = {
        account,
        phone,
        password,
        name: name || `OwO用户_${Math.floor(10000 + Math.random() * 90000)}`,
        img: '/static/images/DefaultAvatar.png',
        isAdmin: 0,
        clubDays: 0,
        points: 0,
        likes: 0,
        coupons: 0,
        footprints: 0
      };

      // 调用创建用户API
      const result = await this.createUser(registerData);
      return result;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  /**
   * 检查账号是否存在
   * @param {string} account 账号
   * @returns {Promise<boolean>} 是否存在
   */
  async checkAccountExists(account) {
    if (!account) {
      throw new Error('账号不能为空');
    }

    try {
      // 使用getAllUsers API来检查账号是否存在，避免依赖可能不存在的detail API
      const users = await this.getAllUsers();
      return users.some(user => user.account === account);
    } catch (error) {
      console.error('检查账号是否存在失败:', error);
      throw error;
    }
  }

  /**
   * 检查手机号是否存在
   * @param {string} phone 手机号
   * @returns {Promise<boolean>} 是否存在
   */
  async checkPhoneExists(phone) {
    if (!phone) {
      throw new Error('手机号不能为空');
    }

    try {
      // 获取所有用户列表，检查手机号是否存在
      const users = await this.getAllUsers();
      return users.some(user => user.phone === phone);
    } catch (error) {
      console.error('检查手机号失败:', error);
      throw error;
    }
  }

  /**
   * 根据账号和手机号修改用户密码（双重验证）
   * @param {string} account 用户账号
   * @param {string} phone 用户手机号
   * @param {string} newPassword 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async updateUserPasswordWithPhone(account, phone, newPassword) {
    if (!account) {
      throw new Error('缺少必填参数: account');
    }

    if (!phone) {
      throw new Error('缺少必填参数: phone');
    }

    if (!newPassword) {
      throw new Error('缺少必填参数: newPassword');
    }

    // 前端手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('手机号格式不正确');
    }

    // 前端密码验证
    if (newPassword.length < 6) {
      throw new Error('密码长度不能少于6位');
    }

    if (newPassword.length > 20) {
      throw new Error('密码长度不能超过20位');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account: account.trim(),
          phone: phone.trim(),
          newPassword: newPassword.trim()
        })
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '修改密码失败');
      }

      return result;
    } catch (error) {
      console.error('修改用户密码失败:', error);
      throw error;
    }
  }

  /**
   * 重置密码（使用POST方法避免CORS问题）
   * @param {string} account 用户账号
   * @param {string} phone 用户手机号
   * @param {string} newPassword 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(account, phone, newPassword) {
    if (!account) {
      throw new Error('缺少必填参数: account');
    }

    if (!phone) {
      throw new Error('缺少必填参数: phone');
    }

    if (!newPassword) {
      throw new Error('缺少必填参数: newPassword');
    }

    // 前端手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('手机号格式不正确');
    }

    // 前端密码验证
    if (newPassword.length < 6) {
      throw new Error('密码长度不能少于6位');
    }

    if (newPassword.length > 20) {
      throw new Error('密码长度不能超过20位');
    }

    try {
      // 使用POST方法创建密码重置请求
      const response = await fetch(`${this.apiUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account: account.trim(),
          phone: phone.trim(),
          newPassword: newPassword.trim()
        })
      });

      const result = await response.json();

      if (result.code !== 200) {
        throw new Error(result.message || '重置密码失败');
      }

      return result;
    } catch (error) {
      console.error('重置密码失败:', error);
      throw error;
    }
  }
}

// 创建默认实例
const userService = new UserService();

// 如果在浏览器环境中，将服务挂载到全局对象
if (typeof window !== 'undefined') {
  window.userService = userService;
}

// 如果使用 ES 模块，可以导出
export default userService;