// backend/config/database.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); //Load environment virables from env file

//connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "isms_db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Andrew98L",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;

// Named query helper for compatibility with route imports
export async function query(sql, params) {
  return pool.query(sql, params);
}
