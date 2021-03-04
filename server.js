'use strict';
// ============== Packages ==============================
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// ============== App ===================================
const PORT = process.env.PORT || 3232;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log('There was an error like dudh', error));

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true})); // tells express to peel off form data and put it into request.body

app.use(express.static(__dirname + '/public'));
// ============== Routes ================================
app.get('/test', handleTest);
app.get('/', getBooksSql);
app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});
app.post('/searches', googleBookRequest);
app.get('/books/:id', getSingleBook);
app.post('/books', saveSingleBook);


// =========== functions ============
function saveSingleBook (req, res) {
  const sqlString2 = `INSERT INTO book_table (authors, title, isbn, image_url, book_description, pubDate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, authors, title, isbn, image_url, book_description, pubDate`;
  const sqlArray2 = [req.body.authors, req.body.title, req.body.isbn, req.body.image_url, req.body.book_description, req.body.pubDate];
  client.query(sqlString2, sqlArray2)
    .then(results => {
      const ejsObject3 = {bookSearchArray: req.body};
      res.redirect('/books/' + results.rows[0].id);
      // res.render('pages/books/detail.ejs', ejsObject3);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books ');
    });
}

function getSingleBook (req, res) {
  const sqlString = 'SELECT * FROM book_table WHERE id = $1;';
  const sqlArray = [req.params.id]; //params gives you the parameter of what was in the url/
  client.query(sqlString, sqlArray)
    .then (result => {
      const ejsObject = { bookSearchArray: result.rows[0]};
      res.render('./pages/books/detail.ejs', ejsObject);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books');
    });
}

function getBooksSql (req, res) {
  const sqlString = 'SELECT * FROM book_table;';
  client.query(sqlString)
    .then (result => {
      const sqlObject = { bookSearchArray: result.rows};
      res.render('./pages/index.ejs', sqlObject);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books');
    });
}

function handleTest(req, res) {
  res.render('./pages/index.ejs');
}

function googleBookRequest(req, res) {
  let bookSearch = req.body.bookSearch; //because it is a POST method data shows up in req.body
  let search = req.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${search}:${bookSearch}`;
  superagent.get(url)
    .then(bookDataFromGoogle => {
      const bookSearchArray = bookDataFromGoogle.body.items.map(bookResults => new Books(bookResults));
      res.render('pages/searches/show.ejs', {bookSearchArray:bookSearchArray});
      // res.redirect('pages/searches/show.ejs');
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with looking up books at google');
    });
}

function Books(booksFromGoogle) {
  this.authors = booksFromGoogle.volumeInfo.authors;
  this.title = booksFromGoogle.volumeInfo.title;
  this.isbn = booksFromGoogle.volumeInfo.industryIdentifiers ? booksFromGoogle.volumeInfo.industryIdentifiers[1].type + booksFromGoogle.volumeInfo.industryIdentifiers[1].identifier : 'no ISBN number';
  this.image_url = booksFromGoogle.volumeInfo.imageLinks ? booksFromGoogle.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.book_description = booksFromGoogle.volumeInfo.description;
  this.pubDate = booksFromGoogle.volumeInfo.publishedDate;
}

// ============== Initialization ========================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
  }).catch(errorThatComesBack => {
    console.log(errorThatComesBack);
  });
