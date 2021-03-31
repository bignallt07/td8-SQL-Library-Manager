var express = require('express');
var router = express.Router();

// 6. Test book model
const Book = require("../models").Book;

/* GET home page. */
router.get('/', async (req, res, next) => {
  // res.render('index', { title: 'Express' });
  const books = await Book.findAll();
  console.log(books.map(book => book.toJSON()));
  res.render("index", { books, title: "My Books" });
});

module.exports = router;
