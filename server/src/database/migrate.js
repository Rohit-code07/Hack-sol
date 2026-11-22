import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, closeDb } from "../config/database.js";

const currentFile = fileURLToPath(import.meta.url);
const migrationsDir = path.join(path.dirname(currentFile), "migrations");

/**
 * Runs every .sql file in the migrations folder, sorted by filename.
 * Applied migrations are recorded in schema_migrations, so they never run twice.
 * Each file runs inside its own transaction.
 *
 * @param {import("better-sqlite3").Database} db - An open better-sqlite3 connection.
 * @returns {number} Number of migrations applied in this run.
 */
export function runMigrations(db) {
  db.exec(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT
    )`
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const isApplied = db.prepare("SELECT 1 FROM schema_migrations WHERE name = ?");
  const markApplied = db.prepare(
    "INSERT INTO schema_migrations (name, applied_at) VALUES (?, datetime('now'))"
  );

  let appliedCount = 0;

  for (const file of files) {
    if (isApplied.get(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const applyOne = db.transaction(() => {
      db.exec(sql);
      markApplied.run(file);
    });

    applyOne();
    appliedCount += 1;
  }

  return appliedCount;
}

if (path.resolve(process.argv[1] ?? "") === currentFile) {
  try {
    const applied = runMigrations(getDb());
    console.log(`Migrations applied: ${applied}`);
  } finally {
    closeDb();
  }
}