var express = require('express');
var router = express.Router();

var {rdb} = require('../db/db')

/* GET  */ 
//GET请求携带的参数使用req.query获取 POST请求携带的参数使用req.body获取
router.get('/index/user', (req, res)=> {
  rdb('SELECT * FROM `users`').then(data=>{
    res.send(data)
  }).catch(err=>{
    res.send(err)
  })
}); 

/* POST  */
router.post('/index/user',(req, res)=> {
  //1.接受前端发送的数据，通过req.body接受
  const {username,password,email,status} = req.body;
  //2.插入MySQL数据中
  rdb("INSERT INTO users (username, password, email, status) VALUES (?, ?, ?, ?)",[username, password,email,status]).then((data)=>{
    res.send({
      code:200,
      message:"增加用户信息成功"
    });
  }).catch(err=>{
    res.send({
      code:400,
      err
    })
  })
})

/* PUT  */
router.put('/index/user',(req, res)=>{
  //1.接受前端发送的数据，通过req.body接受
  const {username,email,id} = req.body;
  //2.插入MySQL数据中
  rdb("UPDATE users SET username = ?, email = ? WHERE id = ?;",[username, email, id]).then((data)=>{
    res.send({
      code:200,
      message:`修改${username}信息成功`
    });
  }).catch(err=>{
    res.send({
      code:400,
      err
    })
  })
})

/* DELETE  */
router.delete('/index/user',(req, res)=>{
  //1.接受前端发送的数据，通过req.body接受
  let id =Number(req.query.id)
  //2.插入MySQL数据中
  rdb("DELETE FROM users WHERE id = ?;",[id]).then((data)=>{
    res.send({
      code:200,
      message:`删除用户信息成功`
    });
  }).catch(err=>{
    res.send({
      code:400,
      err
    })
  })
})

module.exports = router;