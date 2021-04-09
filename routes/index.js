var express = require('express');
var router = express.Router();

// Importing the Book model
const Book = require("../models").Book;

/**
 * ROUTES
 */

/* GET - Home page which redirect to books. */
router.get('/', (req, res) => {
  res.redirect("books");
});

/* GET - /books - FULL LIST OF BOOKS */
router.get('/books', async (req, res) => {
  // Set up Pagination here
  const books = await Book.findAll({order: [["title"]]});
  // console.log(books.length) - ADD to the end of ^^ , offset: 3, limit: 10
  res.render("index", { books, title: "Books" });
});

/* GET - Renders the new book form */
router.get("/books/new", (req, res, next) => {
  //const books = await Book.findAll();   // Probably need something else
  res.render("new-book", {title: "New Book"});
});

/**
 * POST - /books/new
 * Description: 
 *        If NO ERROR: Creates a new book and stores to the database
 *        IF ERROR: Prebuilds the book, but displays the error on the page 
 **/
router.post("/books/new", async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", {book, errors: error.errors, title: "New Book"});
    } else {
      throw Error;
    }
  }
})

/* GET - Shows the form with filled in details */
router.get("/books/:id", async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);    // This find the id in the url. See index note
  if (book) {
    res.render("update-book", {book, title: "Update Book"});
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "Sorry! We couldn't find the page you were looking for.";
    next(err);
  }
});

/* POST - Finds the book and allows you to update the book entry using req.body */
router.post("/books/:id", async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.update(req.body);
  res.redirect("/");
});

/* POST - Deletes a book from the database */
router.post("/books/:id/delete", async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect("/");
});


module.exports = router;
