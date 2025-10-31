import Database from "better-sqlite3";
import path from "path";

const db: Database.Database = new Database(path.join(__dirname, "../laundry.db"));

// Create table for laundry cards
db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('queue', 'washer', 'dryer', 'fold')),
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    backgroundColor TEXT,
    textColor TEXT
  )
`);

// Add color columns if they don't exist (migration)
// Check if backgroundColor column exists
const backgroundColorColumn = db
  .prepare(`PRAGMA table_info(cards)`)
  .all()
  .find((column: any) => column.name === "backgroundColor");

if (!backgroundColorColumn) {
  db.exec(`ALTER TABLE cards ADD COLUMN backgroundColor TEXT`);
  console.log("Added backgroundColor column to cards table");
}

// Check if textColor column exists
const textColorColumn = db
  .prepare(`PRAGMA table_info(cards)`)
  .all()
  .find((column: any) => column.name === "textColor");

if (!textColorColumn) {
  db.exec(`ALTER TABLE cards ADD COLUMN textColor TEXT`);
  console.log("Added textColor column to cards table");
}

export default db;
