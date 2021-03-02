'use strict'
// ============== Packages ==============================
const express = require('express');
const superagent = require('superagent');
// const pg = require('pg');
require('dotenv').config();

// ============== App ===================================
const app = express();
const PORT = process.env.PORT;
// const DATABASE_URL = process.env.DATABASE_URL;
// const client = new pg.Client(DATABASE_URL);
// client.on('error', error => console.log('There was an error like dudh', error));

app.use(express.static('./public')); // serve all the files in the specified folder
app.use(express.urlencoded({extended: true})); // tells express to peel off form data and put it into request.body
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// ============== Routes ================================
app.get('/test', (req, res) => {
  res.render('./pages/index.ejs');
});

app.get('/searches/new', (req, res) => {
  console.log(req.query);
  res.render('./pages/searches/new.ejs');
});

app.post('/searches', (req, res) => {
  // console.log('Here is the REQU BODY ====================================================',req.body);
  let bookSearch = req.body.bookSearch;
  let search = req.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${search}:${bookSearch}`;
  superagent.get(url)
    .then(bookDataFromGoogle => {
      // console.log('HERE IS THE GOOGLE FEEDBACK ==============================', bookDataFromGoogle.body);
      const bookSearchArray = bookDataFromGoogle.body.items.map(bookResults => new Books(bookResults));
      res.render('pages/searches/show.ejs', {bookSearchArray:bookSearchArray});
      // res.redirect('pages/searches/show.ejs');
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books');
    });
});

function Books(booksFromGoogle) {
  this.img = booksFromGoogle.volumeInfo.imageLinks ? booksFromGoogle.volumeInfo.imageLinks.smallThumbnail : "https://i.imgur.com/J5LVHEL.jpg";
  this.title = booksFromGoogle.volumeInfo.title;
  this.authors = booksFromGoogle.volumeInfo.authors;
  // this.isbn = booksFromGoogle.volumeInfo.industryIdentifiers ? booksFromGoogle.volumeInfo.industryIdentifiers[1].type + booksFromGoogle.volumeInfo.industryIdentifiers[1].identifier : 'no ISBN number';
  this.description = booksFromGoogle.volumeInfo.description;
  this.pubDate = booksFromGoogle.volumeInfo.publishedDate;
}


// ============== Initialization ========================
// client.connect()
// .then(() => {
app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
// });

