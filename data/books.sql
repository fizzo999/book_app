-- psql -d book_database -f books.sql

DROP TABLE IF EXISTS book_table;

CREATE TABLE book_table (
  id SERIAL PRIMARY KEY,
  authors VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  book_description TEXT,
  pub_date VARCHAR(255)
);
