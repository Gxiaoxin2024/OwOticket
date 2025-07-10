var express = require('express');
var router = express.Router();
//读取数据并放在order中
var connection = require('../db/sql')

/* GET users listing. */
router.get('/', function(req,res,next){
  connection.query('SELECT * FROM user',function(error,results,fields){
    if(error) throw error;
    console.log('The solutions is :',results);
    res.send(results)
  });
});

/* POST users listing. */

/* PUT users listing. */

/* DELETE users listing. */


module.exports = router;
