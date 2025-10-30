import Database from 'better-sqlite3';
import path from 'path';

const db: Database.Database = new Database(path.join(__dirname, '../laundry.db'));

// Create table for laundry cards
db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('queue', 'washer', 'dryer', 'fold')),
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
