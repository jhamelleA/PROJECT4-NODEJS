require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    
});

pool.getConnection()
   .then(conn => {
        console.log("Database Connected Successfully!");
        conn.release();
    })
    .catch(err => {
        console.error("Database connection failed:", err.message);
    });

module.exports = pool;