import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
});

// ✅ Test route — fetch data from MySQL
router.get("/", (req, res) => {
  connection.query("SELECT * FROM patients LIMIT 5", (err, results) => {
    if (err) {
      console.error("❌ Error fetching data:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

export default router;