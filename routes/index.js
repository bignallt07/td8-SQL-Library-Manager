var express = require('express');
var router = express.Router();

// Importing the Book model
const Book = require("../models").Book;

// So we can use the operator property in sequelize
const { Op } = require("sequelize");

/**
 * ROUTES
 */

/* GET - Home page which redirect to books. */
router.get('/', (req, res) => {
  res.redirect("books");
});


/**
 * GET - /books - FULL LIST OF BOOKS
 * Description - This collects ALL the books to determine the pagination number to display
 *             - Collects the books, and renders only 8 to the page
 */
router.get('/books', async (req, res) => {
  const pagination = await Book.findAll();
  const books = await Book.findAll({order: [["title"]], limit: 8});
  const totalPages = Math.ceil(pagination.length / 8);
  res.render("index", { books, title: "Books", totalPages});
});

/**
 * GET - /books/search
 * Description - This uses the query string to filter through the database using operators 
 * @returns - {page} - Returns the rendered search page
 */ 

router.get("/books/search", async (req, res) => {
  const searchedWord = req.query.search;
  const books = await Book.findAll({
    where: {
      [Op.or]: {
        title: {
          [Op.like]: `%${searchedWord}%`
        },
        author: {
          [Op.like]: `%${searchedWord}%`
        },
        genre: {
          [Op.like]: `%${searchedWord}%`
        },
        year: {
          [Op.like]: `%${searchedWord}%`
        },
      }
    }
  });
  res.render("search", {books, title: "Books"});
});

/**
 * GET /books/section/:id 
 * Description - Using req.params.id, this routes collects all the books to determine which 8 to show
 *             - Line 71 has some Math in the offset to determine this.
 * @returns - {rendered page} - This using a BOOLEAN to determine whether the url includes the word "section". - See index.pug to see this in action
 */ 
router.get("/books/section/:id", async (req, res) => {
  const sectionId = req.params.id;
  const pagination = await Book.findAll();
  const totalPages = Math.ceil(pagination.length / 8);
  const books = await Book.findAll({order: [["title"]], offset: (sectionId * 8) - 8, limit: 8});
  res.render("index", { books, title: "Books", totalPages, section: true});
});


/* GET - Renders the new book form */
router.get("/books/new", (req, res, next) => {
  res.render("new-book", {title: "New Book"});
});

/**
 * POST - /books/new
 * Description: 
 *        If NO ERROR: Creates a new book and stores to the database
 *        IF ERROR: Prebuilds the book, but displays the validation error on the page 
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

/* GET - Shows the form with filled in details
* Note: Checks for a book, if there is no book with that ID, it calls the GLOBAL error handler
*/
router.get("/books/:id", async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);  
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
