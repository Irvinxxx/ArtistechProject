const mysql = require('mysql2/promise');
const config = require('./index');

let db;

async function connectDB() {
  try {
    db = await mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

const getDB = () => db;

module.exports = { connectDB, getDB }; 