import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '1234';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_NAME = process.env.DB_NAME || 'migrant_health_db';

let pool = null;

export async function initDatabase() {
  try {
    // 1. Connect without selecting database to ensure DB exists
    const rootConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
      multipleStatements: true,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConnection.end();

    // 2. Create the connection pool with the database
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      multipleStatements: true,
    });

    console.log(`[Database] Successfully connected to MySQL database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}`);
    return pool;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MySQL:`, error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initDatabase() first.');
  }
  return pool;
}

export async function query(sql, params) {
  const p = getPool();
  const [results] = await p.query(sql, params);
  return results;
}
