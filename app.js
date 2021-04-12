const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const db = require("./models"); // Requires the sequelize instance - To connect with DB
const indexRouter = require('./routes/index');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/**
 * Middlewear
 */

// Express Created Middlewear
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middlewear for Static Files
app.use(express.static(path.join(__dirname, 'public'))); 

// The Route Handler
app.use('/', indexRouter);


/**
 * Error Middlewear
 */

/**
 * 404 Handler
 * Description: This creates a new error, setting the status and message.
 *              Then renders the correct page and a message to the console
 */
app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = "Sorry! We couldn't find the page you were looking for.";
  res.render("page-not-found", {err, title: "Page Not Found"});
  console.log(`There was a ${err.status} error. Message: ${err.message}`);
});

/**
 * Global Error Handler
 *    Description: Checks to see if there is an error, and if 404 - render the correct page
 *                 If not a 404 error, sets the status to 500 if there is no status.
 *                 Sets a new error message and renders the error page.
 */
app.use((err, req, res, next) => {
  if (err) {
    if (err.status === 404) {
      res.status = 404;
      res.render("page-not-found", {err, title: "Page Not Found"});
    } else {
      err.message = "Sorry! There was an unexpected server error";
      res.status = err.status || 500;
      res.render("error", {err, title: "Server Error"});
    }
    console.log(`There was a ${err.status} error. Message: ${err.message}`);
  }
});
  

/**
 * ASYNC Handler that connects to the Database
 * Note: Add "force: true" in the sync to reset the tables
 */
(async () => {
  await db.sequelize.sync(); 
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}) ();

// Exports the app
module.exports = app;


// NOTE FOR REVIEWER
/*
I got quite confused with the error handling section of this. So, this was my first attempt following the instructions, if the one above is not quite right. Can you help me with this version. 

app.use((err, req, res, next) => {
  res.locals.err = err;
  res.status(err.status);
  if (err.status !== 404) {
    // Set err.status to 500 if status not already defined
    err.status = 500
     // Set the Err.message to friendly message
    err.message = "Sorry! There was an unexpected error on the server."
    // Render Page not found - PASS Error, 
    res.render("error", {err, title: "Server"});
  } else {
    // render error template with err passed as second param
    // res.render("page-not-found", {err, title: "Page Not Found"})
  }
  // Log the error status and message to console
  console.log(`${err.message} - Error Status: ${err.status}`);  
});

Hopefully, no need for this
 */