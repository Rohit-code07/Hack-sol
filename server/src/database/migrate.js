import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, closeDb } from "../config/database.js";

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");

/**
 * Runs every .sql file in the migrations folder in filename order.
 * Each migration is idempotent (CREATE ... IF NOT EXISTS).
 *
 * @returns {string[]} Names of the migration files that were applied.
 */
export function runMigrations() {
  const db = getDb();
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec(sql);
  }

  return files;
}

try {
  const applied = runMigrations();
  process.stdout.write(`Migrations applied: ${applied.length}\n`);
} finally {
  closeDb();
}