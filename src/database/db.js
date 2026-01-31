import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

/**
 * Initialize the database and create tables if they don't exist
 */
export function initDatabase(dbPath) {
  // Ensure the directory exists
  const dbDir = dirname(dbPath);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create balances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      current_balance REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      balance_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      source_message_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (balance_id) REFERENCES balances(id)
    )
  `);

  // Create index for faster date queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date 
    ON transactions(date(created_at))
  `);

  // Unique index for idempotency (anti-double post)
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_msg_id 
    ON transactions(source_message_id)
  `);

  // Initialize mom's balance if it doesn't exist
  const insertBalance = db.prepare(`
    INSERT OR IGNORE INTO balances (name, current_balance) 
    VALUES ('mom', 0)
  `);
  insertBalance.run();

  console.log('✅ Database initialized successfully');
  return db;
}

/**
 * Get the database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}
