const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables from a .env file

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Yugesh@123",
  database: process.env.DB_NAME || "foodie_hub",
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");
});

module.exports = connection;
