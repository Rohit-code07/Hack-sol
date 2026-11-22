import { getDb, closeDb } from "../config/database.js";
import { runMigrations } from "./migrate.js";
import { insertFarmers } from "./seeds/farmerSeed.js";
import { insertLandRecords } from "./seeds/landSeed.js";
import { insertEntitlements } from "./seeds/entitlementSeed.js";
import { insertGrievances } from "./seeds/grievanceSeed.js";

const tablesToClear = [
  "activity_logs",
  "verifications",
  "grievances",
  "entitlements",
  "land_records",
  "farmers",
];

/**
 * Clears all tables (children first) and inserts the synthetic demo data
 * (parents first) inside one transaction, so the script can be re-run safely.
 *
 * @returns {{ farmers: number, land: number, entitlements: number, grievances: number }}
 */
export function runSeed() {
  const db = getDb();

  const seedAll = db.transaction(() => {
    for (const table of tablesToClear) {
      db.prepare(`DELETE FROM ${table}`).run();
    }

    return {
      farmers: insertFarmers(db),
      land: insertLandRecords(db),
      entitlements: insertEntitlements(db),
      grievances: insertGrievances(db),
    };
  });

  return seedAll();
}

try {
  runMigrations();
  const counts = runSeed();
  process.stdout.write(
    `Seeded: ${counts.farmers} farmers, ${counts.land} land records, ` +
      `${counts.entitlements} entitlements, ${counts.grievances} grievances\n`
  );
} finally {
  closeDb();
}