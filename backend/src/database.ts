import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "laundry_tool",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  // For development, you might want to disable SSL
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(dbConfig);

// Initialize database tables
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create table for laundry cards
    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('queue', 'washer', 'dryer', 'fold')),
        position INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        background_color TEXT,
        text_color TEXT
      )
    `);

    // Check if backgroundColor column exists (for migration from SQLite naming)
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cards' AND column_name IN ('backgroundcolor', 'textcolor')
    `);

    // Migrate old column names if they exist
    if (checkColumns.rows.some((row: any) => row.column_name === 'backgroundcolor')) {
      await client.query(`ALTER TABLE cards RENAME COLUMN backgroundcolor TO background_color`);
      console.log("Renamed backgroundcolor column to background_color");
    }

    if (checkColumns.rows.some((row: any) => row.column_name === 'textcolor')) {
      await client.query(`ALTER TABLE cards RENAME COLUMN textcolor TO text_color`);
      console.log("Renamed textcolor column to text_color");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Initialize the database when the module is loaded
initDatabase().catch(console.error);

export default pool;
