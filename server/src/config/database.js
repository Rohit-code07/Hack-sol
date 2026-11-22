import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { env } from "./env.js";

let db = null;

export function getDb() {
  if (db) {
    return db;
  }

  const dbPath = path.resolve(env.DB_PATH);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}