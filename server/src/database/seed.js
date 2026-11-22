import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, closeDb } from "../config/database.js";
import { insertFarmers } from "./seeds/farmerSeed.js";
import { insertLandRecords } from "./seeds/landSeed.js";
import { insertEntitlements } from "./seeds/entitlementSeed.js";
import { insertGrievances } from "./seeds/grievanceSeed.js";

const currentFile = fileURLToPath(import.meta.url);

// Child tables first, parent last, so foreign keys are never violated.
// Tables that do not exist in the current schema (for example loans, discrepancies) are skipped.
const clearOrder = [
  "grievances",
  "discrepancies",
  "verifications",
  "activity_logs",
  "entitlements",
  "loans",
  "land_records",
  "farmers",
];

/**
 * Clears all known tables (children first) and inserts the synthetic demo data
 * (parents first) inside one transaction, so it can be re-run safely.
 *
 * @param {import("better-sqlite3").Database} db - An open better-sqlite3 connection.
 * @returns {{ farmers: number, landRecords: number, entitlements: number, grievances: number }}
 */
export function runSeeds(db) {
  const existingTables = new Set(
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name)
  );

  const seedAll = db.transaction(() => {
    for (const table of clearOrder) {
      if (existingTables.has(table)) {
        db.prepare(`DELETE FROM ${table}`).run();
      }
    }

    const farmers = insertFarmers(db);
    const landRecords = insertLandRecords(db);
    const entitlements = insertEntitlements(db);
    const grievances = insertGrievances(db);

    return { farmers, landRecords, entitlements, grievances };
  });

  return seedAll();
}

if (path.resolve(process.argv[1] ?? "") === currentFile) {
  try {
    runSeeds(getDb());
    console.log("Seeds applied");
  } finally {
    closeDb();
  }
}