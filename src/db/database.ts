import * as SQLite from "expo-sqlite";

export let db: SQLite.SQLiteDatabase;

export async function initDB() {
  db = await SQLite.openDatabaseAsync("attendance.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      secretBadge TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER,
      date TEXT,
      time TEXT,
      type TEXT
    );
  `);
}
