const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Import sequelize database that was set up in index.js

const db = require("./models");
// const sequelize = require("sequelize");
// const {Book} = db.models;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
// const book = require('./models/book');
// const book = require('./models/book');

const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);



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

// This was difficult, and I am not sure if it is completed yet, but I think I have it :)
// We needed to require db from index above, then await the database connection.
(async () => {
  await db.sequelize.sync({force: true});
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}) ();





module.exports = app;