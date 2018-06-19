var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
const logger = require('heroku-logger');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const jsforce = require('jsforce');

const loginInfo = {};
const conns = [];

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* GET home page. */
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Platform Event Multiplexer' });
});

// post orgId, sessionId, serverURL
app.post('/sessionId', function (req, res, next) {

  console.log(req.body);
  // auth
  const conn = new jsforce.Connection({
    serverUrl: req.body.serverUrl,
    sessionId: req.body.sessionId,
    orgId: req.body.orgId
  });

  logger.log(conn);

  // add sessions to the session pile
  conns.push(conn);
  res.send('connected');
});

// app.post('/credentials', function (req, res, next) {
//   res.send();
// });

app.post('/events/:sobject', function (req, res, next) {
  const sobject = req.params.sobject;
  conns.forEach((conn) => {
    conn.sobject(sobject).create(req.body);
  });
});



app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;

const port = process.env.PORT || 8443;

app.listen(port, () => {
  logger.info(`Example app listening on port ${port}!`);
});