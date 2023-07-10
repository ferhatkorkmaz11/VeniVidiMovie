const mysql = require("mysql");
require("dotenv").config();
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});
module.exports = connection;
