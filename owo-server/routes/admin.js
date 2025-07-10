const express = require('express');
const router = express.Router();
const {rdb} = require('../db/db');

// 用户管理模块
const userManager = {
  // 获取所有用户
  getAllUsers: async () => {
    return await rdb('SELECT * FROM `user`');
  },

  // 根据 account 获取用户
  getUserByAccount: async (account) => {
    const users = await rdb('SELECT * FROM `user` WHERE account = ?', [account]);
    return users.length > 0 ? users[0] : null;
  },

  // 创建新用户
  createUser: async (userData) => {
    const {
      name, account, isAdmin, phone, password, img,
      clubDays, points, likes, coupons, footprints
    } = userData;
    return await rdb(
      `INSERT INTO user
       (name, account, isAdmin, phone, password, img, clubDays, points, likes, coupons, footprints)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, account, isAdmin, phone, password, img, clubDays, points, likes, coupons, footprints]
    );
  },

  // 更新用户信息 - 修改为根据 account 更新
  updateUser: async (userData) => {
    const { account, name, phone, password, img, clubDays, points, likes, coupons, footprints } = userData;
    return await rdb(
      `UPDATE user SET
       name = ?, phone = ?, password = ?, img = ?, clubDays = ?, points = ?, likes = ?, coupons = ?, footprints = ?
       WHERE account = ?`,
      [name, phone, password, img, clubDays, points, likes, coupons, footprints, account]
    );
  },

  // 修改用户密码 - 根据 account 修改密码
  updateUserPassword: async (account, newPassword) => {
    return await rdb(
      'UPDATE user SET password = ? WHERE account = ?',
      [newPassword, account]
    );
  },

  // 删除用户
  deleteUser: async (account) => {
    return await rdb('DELETE FROM user WHERE account = ?', [account]);
  }
};

// 路由实现
router.get('/user', async (req, res) => {
  try {
    const users = await userManager.getAllUsers();
    res.send({
      code: 200,
      data: users,
      message: '用户数据获取成功'
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      message: '服务器内部错误',
      error: err.message
    });
  }
});

router.post('/user', async (req, res) => {
  try {
    // 数据验证
    const requiredFields = ['name', 'account', 'phone', 'password'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({
          code: 400,
          message: `缺少必填字段: ${field}`
        });
      }
    }

    // 创建用户
    await userManager.createUser({
      name: req.body.name,
      account: req.body.account,
      isAdmin: req.body.isAdmin || 0,
      phone: req.body.phone,
      password: req.body.password,
      img: req.body.img || '/static/images/DefaultAvatar.png',
      clubDays: req.body.clubDays || 0,
      points: req.body.points || 0,
      likes: req.body.likes || 0,
      coupons: req.body.coupons || 0,
      footprints: req.body.footprints || 0
    });

    res.send({
      code: 200,
      message: '用户创建成功'
    });
  } catch (err) {
    // 处理唯一性约束错误
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).send({
        code: 409,
        message: '账户名已存在，请使用其他账户名'
      });
    }
    
    res.status(500).send({
      code: 500,
      message: '用户创建失败',
      error: err.message
    });
  }
});

router.put('/user', async (req, res) => {
  try {
    if (!req.body.account) {
      return res.status(400).send({
        code: 400,
        message: '缺少用户账号参数'
      });
    }

    // 检查用户是否存在
    const user = await userManager.getUserByAccount(req.body.account);
    if (!user) {
      return res.status(404).send({
        code: 404,
        message: '用户不存在'
      });
    }

    await userManager.updateUser({
      account: req.body.account,
      name: req.body.name || user.name,
      phone: req.body.phone || user.phone,
      password: req.body.password || user.password,
      img: req.body.img || user.img,
      clubDays: req.body.clubDays || user.clubDays,
      points: req.body.points || user.points,
      likes: req.body.likes || user.likes,
      coupons: req.body.coupons || user.coupons,
      footprints: req.body.footprints || user.footprints
    });

    res.send({
      code: 200,
      message: '用户信息更新成功'
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      message: '用户信息更新失败',
      error: err.message
    });
  }
});

router.delete('/user', async (req, res) => {
  try {
    const account = req.query.account
    if (!account) {
      return res.status(400).send({
        code: 400,
        message: '缺少必要参数: account'
      });
    }

    // 检查用户是否存在
    const user = await userManager.getUserByAccount(account);
    if (!user) {
      return res.status(404).send({
        code: 404,
        message: '用户不存在'
      });
    }

    // 删除用户数据
    await userManager.deleteUser(account);

    res.send({
      code: 200,
      message: '用户删除成功'
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      message: '用户删除失败',
      error: err.message
    });
  }
});

/**
 * PATCH /user - 修改用户密码
 * 根据account和phone修改用户密码，双重验证确保安全
 */
router.patch('/user', async (req, res) => {
  try {
    const { account, phone, newPassword } = req.body;

    // 参数验证
    if (!account) {
      return res.status(400).send({
        code: 400,
        message: '缺少必要参数: account'
      });
    }

    if (!phone) {
      return res.status(400).send({
        code: 400,
        message: '缺少必要参数: phone'
      });
    }

    if (!newPassword) {
      return res.status(400).send({
        code: 400,
        message: '缺少必要参数: newPassword'
      });
    }

    // 密码长度验证
    if (newPassword.length < 6) {
      return res.status(400).send({
        code: 400,
        message: '密码长度不能少于6位'
      });
    }

    // 检查用户是否存在
    const user = await userManager.getUserByAccount(account);
    if (!user) {
      return res.status(404).send({
        code: 404,
        message: '用户不存在'
      });
    }

    // 验证手机号是否匹配
    if (user.phone !== phone) {
      return res.status(403).send({
        code: 403,
        message: '手机号验证失败，无法修改密码'
      });
    }

    // 修改密码
    const result = await userManager.updateUserPassword(account, newPassword);

    // 检查是否修改成功
    if (result.affectedRows === 0) {
      return res.status(500).send({
        code: 500,
        message: '密码修改失败，请重试'
      });
    }

    res.send({
      code: 200,
      message: '密码修改成功',
      data: {
        account: account,
        updated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('修改用户密码失败:', err);
    res.status(500).send({
      code: 500,
      message: '修改用户密码失败',
      error: err.message
    });
  }
});

module.exports = router;