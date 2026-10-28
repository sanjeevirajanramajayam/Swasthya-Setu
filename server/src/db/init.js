import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getPool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migration] Starting database schema initialization...');
  await initDatabase();
  const pool = getPool();
  
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split queries by semicolon (taking care of triggers/delimiter if any)
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      console.error('[Migration Error on statement]:', statement.slice(0, 80), '->', err.message);
      throw err;
    }
  }

  console.log('[Migration] All tables successfully verified & migrated!');
}
