var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 配置CORS，允许跨域请求
app.use(cors({
  origin: '*', // 允许所有域名访问，生产环境建议指定具体域名
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 增加请求体大小限制
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    // 可以在这里添加额外的验证逻辑
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true 
}));

// 添加请求大小监控中间件
app.use((req, res, next) => {
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
    return res.status(413).json({
      code: 413,
      message: '请求数据过大'
    });
  }
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//页面路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

//api路由
var apiRouter = require('./routes/api');
var adminRouter = require('./routes/admin');
var commonRouter = require('./routes/common');
var orderRouter = require('./routes/order');
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/common',commonRouter);
app.use('/order',orderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // 如果是 API 请求，返回 JSON 格式的 404 错误
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      code: 404,
      message: '接口不存在',
      error: '请求的 API 接口未找到',
      timestamp: new Date().toLocaleString()
    });
  }
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // 如果是 API 请求，返回 JSON 格式的错误
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      code: err.status || 500,
      message: err.message || '服务器内部错误',
      error: req.app.get('env') === 'development' ? err.stack : '服务器错误',
      timestamp: new Date().toLocaleString()
    });
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
