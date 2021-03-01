'use strict'

const express = require('express');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT;

app.use(express.static('./public')); // serve all the files in the specified folder
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));


app.set('view engine', 'ejs');

app.get('/test', (req, res) => {
  res.render('./pages/index.ejs')
});



app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));

