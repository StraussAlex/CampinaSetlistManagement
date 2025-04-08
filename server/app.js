const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const { MongoClient } = require('mongodb');
const DB_URI = "mongodb://mongo:27017/";
const DB_NAME = "campina-band-setlist-management";

const indexRouter = require('./routes/index');
const songRouter = require('./routes/songs');
const setlistRouter = require('./routes/setlists');
const eventRouter = require('./routes/events');
const userRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async(req, res, next) => {
	try {
		const client = new MongoClient(DB_URI);
		await client.connect();
		req.db = client.db(DB_NAME);
		console.log("Connection successful!");
		next();
	} catch(error) {
		console.log("DB Connection Error: " + error);
		next(createError(500), error);
	}
});

app.use('/', indexRouter);
app.use('/songs', songRouter);
app.use('/setlists', setlistRouter);
app.use('/events', eventRouter);
app.use('/users', userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
