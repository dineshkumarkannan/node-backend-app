import { DatabaseSync } from "node:sqlite";

// This database exists only in memory and is cleared whenever the server restarts.
// Use a file-backed database and a Docker volume when persistence is needed.
const db = new DatabaseSync(":memory:");

// Store credentials for authentication.
db.exec(`
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`);

// Store todos and associate each one with its owning user.
db.exec(`
    CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        task TEXT,
        status BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
`);

export default db;
