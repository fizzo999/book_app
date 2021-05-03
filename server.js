'use strict';
// ============== Packages ==============================
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

const pg = require('pg');

const methodOverride = require('method-override');
require('dotenv').config();
const base64 = require('base-64');

// ============== App ===================================
// database setup
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log('There was an error like dudh', error));

// Application Setup
const app = express();
const PORT = process.env.PORT || 3232;

// --------------------------------
let sqlObject = {};
const tokenArray = [];
// --------------------------------

// Application Middleware
app.use(express.urlencoded({extended: true})); // tells express to peel off form data and put it into request.body
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(cors());

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// ============== Routes ================================
app.get('/test', handleTest);

// new for signup/signin================================
app.get('/signUp/new', (req, res) => {
  res.render('pages/credentials/signup.ejs');
});
app.post('/signUp', handlesignUp);

app.get('/signIn/new', (req, res) => {
  res.render('pages/credentials/signin.ejs');
});
app.post('/signIn', handlesignIn);

app.get('/aboutUs', (req, res) => {
  res.render('pages/aboutUs.ejs');
})

// ========================================================

app.get('/', getBooksSql);
app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs');
});
app.post('/searches', googleBookRequest);
app.post('/books', saveSingleBook);
app.get('/books/:id', getSingleBook);

app.put('/update/:id', updateBookInfo);
// app.delete('/books/:id', MIDDLEWARE FUNCTION HERE TO CHECK ROLE , deleteBook);
app.delete('/books/:id', frontendMiddlewareFunction('admin'), deleteBook);

app.get('/books/detail-view/:id', redirectToUpdateBook);
app.get('/books/successfullyDeleted', (req, res) => {
  res.render('pages/books/successfullyDeleted.ejs');
});

// =========== functions ============

function handlesignUp(req, res) {
  console.log('HERE IS THE REQ.BODY===================================', req.body);
  // this is where we would switch out the URL for localhost to heroku deployed link
  let url = `http://localhost:3333/signup`;
  superagent.post(url, req.body)
    .then(data => {
      const userDataThatComesBack = data.body;
      console.log('HERE IT IS ==========================================', userDataThatComesBack);
      res.render('pages/credentials/showUserSignup.ejs', {userDataThatComesBack}, );
      // res.redirect('pages/searches/show.ejs');
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with THE SIGN UP');
    });
}
function handlesignIn(req, res) {
  let un = req.body.username; //because it is a POST method data shows up in req.body
  let pw = req.body.password;
  let strg = `${un}:${pw}`;
  let encoded = base64.encode(strg);
  // console.log(base64.decode(encoded));
  // req.headers.authorization = encoded;
  let url = `http://localhost:3333/signin`;
  superagent.post(url)
  .set('authorization', `Basic ${encoded}`)
  // .set('authorization', `bearer ${YELP_API_KEY}`)
    .then(data => {
      console.log(data.body);
      tokenArray.pop();
      tokenArray.push({ username: data.body.username, token: data.body.token, role: data.body.role});
      console.log('here is the token Array - HURRAY HURRAY', tokenArray);
      const userDataThatComesBack = data.body;
      res.render('pages/credentials/showUsers.ejs', {userDataThatComesBack});
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack.message);
      res.status(500).send('Sorry something went wrong with sending the authorization headers');
    });
}

function frontendMiddlewareFunction (role) {
  return (req, res, next) => {
    try {
      // check if token is there, check if token is the same as the one we need
      console.log('HAHA SO YOU ARE A ===============================', tokenArray);
      if(tokenArray.length === 0) {
        next('Please sign in first');
      } else if(tokenArray[0].role === role){
        next();
      } else {
        next('Insufficient access credentials for this operation - please contact the admin');
      }
    } catch(e) {
      next(e.message);
    }
  };
}

// ==========================================================================
function redirectToUpdateBook(req, res) {
  // res.render('pages/books/detail-new.ejs');
  const sqlString = 'SELECT * FROM book_table WHERE id = $1;';
  const sqlArray = [req.params.id]; //params gives you the parameter of what was in the url/
  client.query(sqlString, sqlArray)
    .then (result => {
      const ejsObject = { bookSearchArray: result.rows[0]};
      // console.log('', result.rows[0]);
      res.render('./pages/books/detail-new.ejs', ejsObject);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books GETTING FROM DB');
    });
}

function updateBookInfo(req, res) {
  let sqlString4 = `UPDATE book_table SET authors=$1, title=$2, isbn=$3, image_url=$4, book_description=$5, pub_date=$6 WHERE id=$7;`;
  let sqlArray4 = [req.body.authors, req.body.title, req.body.isbn, req.body.image_url, req.body.book_description, req.body.pub_date, req.params.id];
  client.query(sqlString4, sqlArray4)
    .then(results => {
      res.redirect(`/books/${req.params.id}`);
    })
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
      res.render('pages/books/successfullyDeleted.ejs');
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books DELETE ');
    });
}



function saveSingleBook (req, res) {
  // future to do - check if book already in db - if not save - if yes - redirect to detail page - message already in your collection
  const sqlString2 = `INSERT INTO book_table (authors, title, isbn, image_url, book_description, pub_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
  // console.log(sqlString2);
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
      // console.log('', result.rows[0]);
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
      sqlObject = { bookSearchArray: result.rows};
      res.render('./pages/index.ejs', sqlObject);
    })
    .catch(errorThatComesBack => {
      console.log(errorThatComesBack);
      res.status(500).send('Sorry something went wrong with books GETTING ALL BOOKS FROM DB');
    });
}

function handleTest(req, res) {
  // res.render('./pages/index.ejs');
  res.send('The test is working - you are awesome - keep going');
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
  this.authors = bookObj.volumeInfo.authors ? bookObj.volumeInfo.authors : 'sorry no authors for this item';
  this.title = bookObj.volumeInfo.title ? bookObj.volumeInfo.title : 'sorry no title for this item';
  this.isbn = bookObj.volumeInfo.industryIdentifiers[1] ? bookObj.volumeInfo.industryIdentifiers[1].type + ': ' + bookObj.volumeInfo.industryIdentifiers[1].identifier : 'no ISBN number';
  this.image_url = bookObj.volumeInfo.imageLinks ? bookObj.volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
  this.book_description = bookObj.volumeInfo.description ? bookObj.volumeInfo.description : 'sorry no description for this item';
  this.pub_date = bookObj.volumeInfo.publishedDate ? bookObj.volumeInfo.publishedDate : 'sorry no publishing date for this item';
}

// ============== Initialization ========================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`))
  })
  .catch(errorThatComesBack => {
    console.log(errorThatComesBack);
  });
