'use strict';
// ============== Packages ==============================
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
require('dotenv').config();

// ============== App ===================================
// database setup
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log('There was an error like dudh', error));
// Application Setup
const app = express();
const PORT = process.env.PORT || 3232;

// Application Middleware
app.use(express.urlencoded({extended: true})); // tells express to peel off form data and put it into request.body
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// ============== Routes ================================
app.get('/test', handleTest);
app.get('/', getBooksSql);
app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});
app.post('/searches', googleBookRequest);
app.get('/books/:id', getSingleBook);
app.post('/books', saveSingleBook);

app.put('/update/:id', updateBookInfo);
app.delete('/books/:id', deleteBook);

// =========== functions ============

function updateBookInfo(req, res) {
  console.log('==================================================================================', req.body.pub_date);
  let sqlString4 = `UPDATE book_table SET authors=$1, title=$2, isbn=$3, image_url=$4, book_description=$5, pub_date=$6 WHERE id=$7;`;
  let sqlArray4 = [req.body.authors, req.body.title, req.body.isbn, req.body.image_url, req.body.book_description, req.body.pub_date, req.params.id];
  // console.log(sqlArray4);
  client.query(sqlString4, sqlArray4)
    .then(results => {
      res.redirect(`/books/${req.params.id}`);
    })
    // .then(res.redirect('/books'))
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books UPDATE ');
    });
}

function deleteBook (req, res) {
  let sqlString3 = `DELETE FROM book_table WHERE id=$1;`;
  let sqlArray3 = [req.params.id];
  client.query(sqlString3, sqlArray3)
    .then(results => {
      res.redirect('/');
    })
    // .then(res.redirect('/books'))
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books DELETE ');
    });
}



function saveSingleBook (req, res) {
  const sqlString2 = `INSERT INTO book_table (authors, title, isbn, image_url, book_description, pub_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
  console.log(sqlString2);
  const sqlArray2 = [req.body.authors, req.body.title, req.body.isbn, req.body.image_url, req.body.book_description, req.body.pub_date];
  client.query(sqlString2, sqlArray2)
    .then(results => {
      // const ejsObject3 = {bookSearchArray: req.body};
      res.redirect('/books/' + results.rows[0].id);
      // res.render('pages/books/detail.ejs', ejsObject3);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books SAVING to DB ');
    });
}

function getSingleBook (req, res) {

  const sqlString = 'SELECT * FROM book_table WHERE id = $1;';
  const sqlArray = [req.params.id]; //params gives you the parameter of what was in the url/
  client.query(sqlString, sqlArray)
    .then (result => {
      const ejsObject = { bookSearchArray: result.rows[0]};
      console.log('', result.rows[0]);
      res.render('./pages/books/detail.ejs', ejsObject);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books GETTING FROM DB');
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
      res.status(500).send('Sorry something went wrong with books GETTING ALL BOOKS FROM DB');
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

function Books(bookObj) {
  this.authors = bookObj.volumeInfo.authors;
  this.title = bookObj.volumeInfo.title;
  this.isbn = bookObj.volumeInfo.industryIdentifiers[1] ? bookObj.volumeInfo.industryIdentifiers[1].type + bookObj.volumeInfo.industryIdentifiers[1].identifier : 'no ISBN number';
  this.image_url = bookObj.volumeInfo.imageLinks ? bookObj.volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
  this.book_description = bookObj.volumeInfo.description;
  this.pub_date = bookObj.volumeInfo.publishedDate;
}

// ============== Initialization ========================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
  }).catch(errorThatComesBack => {
    console.log(errorThatComesBack);
  });
