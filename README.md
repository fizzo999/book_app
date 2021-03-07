# book_app

Google Books templating with EJS

# Project Name

**Author**: Your Name Goes Here
**Version**: 1.0.0 (increment the patch/fix version number if you make more commits past your first submission)

## Overview

Problem domain: user is presented with a search input form. An input field to fill in for a book search by title or author (2 radio buttons - click one) and a submit button. Upon submitting the query gets captured and sent in the correct format to google books api. The return is again formatted correctly and then displayed in the browser on a new page using tamplating with ejs.

## Getting Started

Setup filestructure. Install libraries. Code out server.js by calling the libraries, defining the variables and creating the app, setting up the app to listen (on PORT 3000), setting up correct (RESTful) .get and .post routes. Setting up superagent request to correctly formatted google. formatting received data to send to frontend. Code out template to loop over dada Array. Style the input and the results page.

## Architecture

Using EJS templating engine and Express as a server framework plus dotenv to create a Javascript server application. Using superagent framework to make outbound server requests to google books api and handle feedback.

## Change Log

03-01-2021 9:00pm Application now has a fully-functional express server, with GET and POST routes for the book resource.

03-02-2021 6:00am - finish styling - the radio button, the results page, negative margins to handle quicky behavior of ul and li p tags. Fully styled and looking beautiful. I love my product !!!!

## Credits and Collaborations

Credit (and a link) to TA Skyler, Zach, James M and Lydia for help with this.
Credit to https://exceptionshub.com/how-to-change-the-size-of-the-radio-button-using-css.html for teaching me how to style a radio button.

## time sheet

#### Date 03-01-2021

Number and name of feature: file tree setup
Estimate of time needed to complete: 1 HOUR
Start time: 2:00PM
Finish time: 3:00PM
Actual time needed to complete: 1 HOUR

#### Date 03-01-2021

Number and name of feature: setup experimental GET route
Estimate of time needed to complete: 1 HOUR
Start time: 3:00PM
Finish time: 4:00PM
Actual time needed to complete: 1 HOUR

#### Date 03-01-2021

Number and name of feature: setup real GET route to handle request - change it to POST
Estimate of time needed to complete: 2 HOUR
Start time: 4:00PM
Finish time: 6:00PM
Actual time needed to complete: 2 HOUR

#### Date 03-01-2021

Number and name of feature: make API call and handle feedback data
Estimate of time needed to complete: 3 HOUR
Start time: 6:00PM
Finish time: 9:00PM
Actual time needed to complete: 3 HOUR

#### Date 03-01-2021

Number and name of feature: finish templating display results, start styling
Estimate of time needed to complete: 3 HOUR
Start time: 9:00PM
Finish time: 12:00PM
Actual time needed to complete: 3 HOUR

#### Date 03-02-2021

Number and name of feature: finish styling - including the stubborn radio button, and the stubborn UL LIs
Estimate of time needed to complete: 1 HOUR
Start time: 6:30AM
Finish time: 8:00AM
Actual time needed to complete: 1.5 HOUR

#### Date 03-02-2021

Number and name of feature: implementing new file tree
Estimate of time needed to complete: 1 HOUR
Start time: 3:00PM
Finish time: 4:00PM
Actual time needed to complete: 1 HOUR

#### Date 03-02-2021

Number and name of feature: implement GET and POST and SQL
Estimate of time needed to complete: 3 HOUR
Start time: 4:30AM
Finish time: 11:00AM
Actual time needed to complete: 7 HOUR

#### Date 03-03-2021

Number and name of feature: make app work again
Estimate of time needed to complete: 1 HOUR
Start time: 3:00AM
Finish time: 4:00AM
Actual time needed to complete: 1 HOUR

#### Date 03-03-2021

Number and name of feature: add books button - delete route update route
Estimate of time needed to complete: 2 HOUR
Start time: 4:30PM
Finish time: 10:30PM
Actual time needed to complete: 6 HOUR

#### Date 03-06-2021

Number and name of feature: add route to update books - finish styling every single page - test run
Estimate of time needed to complete: 4+ HOUR
Start time: 9:00AM
Finish time: 4:30PM - Lunch BREAK
Actual time needed to complete: 6 HOUR

heroku pg:push **local-db** DATABASE_URL --app **app-name**
