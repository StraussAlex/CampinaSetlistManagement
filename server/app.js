const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const { MongoClient } = require('mongodb');
const DB_URI = "mongodb://mongo:27017/";
const DB_NAME = "campina-band-setlist-management";

const indexRouter = require('./routes/index');
const songRouter = require('./routes/songs');
const setlistRouter = require('./routes/setlists');
const eventRouter = require('./routes/events');
const userRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const authRouter = require('./routes/auth');
//const geniusRouter = require('./routes/genius');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(express.json());
app.use(cors({
	origin: 'http://localhost:5555',  // domains allowed to request from server
	// TODO: modify origin before moving to production!
	credentials: true                // allow cookies to be sent
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: 'super-secret-key',
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
	  mongoUrl: DB_URI + DB_NAME, 
	  collectionName: 'Sessions'  
	}),
	cookie: {
	  maxAge: 1000 * 60 * 60 * 24, 
	  httpOnly: true,
	  secure: false, 
	  sameSite: 'lax'
	}
  }));



const client = new MongoClient(DB_URI);

let db;

// Connect to MongoDB once, before mounting routers
async function connectToDatabase() {
	try {
		console.log("trying to connect")
		await client.connect();
		db = client.db(DB_NAME);
		console.log('MongoDB connection established');
	} catch (error) {
		console.error('MongoDB connection error:', error);
		process.exit(1); // exit on DB connection failure
	}
}

// Middleware to attach db instance to each request
app.use((req, res, next) => {
	if (!db) {
		return next(createError(500, 'Database not connected'));
	}
	req.db = db;
	next();
});

/*
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
*/

app.use('/', indexRouter);
app.use('/songs', songRouter);
app.use('/setlists', setlistRouter);
app.use('/events', eventRouter);
app.use('/users', userRouter);
app.use('/login', loginRouter);
app.use('/auth', authRouter);
//app.use('/genius', geniusRouter);


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

module.exports = { app, connectToDatabase };
