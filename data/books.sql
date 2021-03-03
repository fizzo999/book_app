-- psql -d book_database -f books.sql

DROP TABLE IF EXISTS book_table;

CREATE TABLE book_table (
  id SERIAL PRIMARY KEY,
  authors VARCHAR(255),
  title VARCHAR(255),
  isbn NUMERIC(13),
  image_url VARCHAR(255),
  book_description TEXT,
  pubDate DATE
);
