-- psql -d cityapp_location -f schema.sql

DROP TABLE IF EXISTS previous_requests;

CREATE TABLE previous_requests (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7)
)