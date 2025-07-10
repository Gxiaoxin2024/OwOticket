//导入模块
var mysql = require('mysql2/promise');

require('dotenv').config();

const pool =mysql.createPool({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  waitForConnections:true,
  connectionLimit:10,
  queueLimit:0
})

function rdb(sql,arr=[]){
  return new Promise( async (res,rej)=>{
    try{
      const [rows,fields] = await pool.query(sql,arr);
      res(rows);
    }catch(err){
      rej(err);
    }
  })
}

// 导出连接池和查询函数
module.exports = {
  rdb,
  pool
};

