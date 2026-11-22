// SYNTHETIC DEMO DATA. Illustrative scheme entries, not official government records.
// Note: Eligibility final calculation backend service mein hogi, yahan sirf seed values hain.

// 75 entitlements (ENT-0001 to ENT-0075): 3 per farmer, FRM-0001 to FRM-0025.
// Farmer n gets: A = ENT-(3n-2), B = ENT-(3n-1), C = ENT-(3n).
// DEMO_SCHEME_A due 6000, DEMO_SCHEME_B due 10000, DEMO_SCHEME_C due 4000.
// Rules followed: eligible = 0 means amount_due = 0 and NOT_ELIGIBLE;
// amount_paid never exceeds amount_due; PAID only when amount_paid === amount_due.
// INACTIVE farmers (FRM-0009, 0017, 0023): NOT_ELIGIBLE for all schemes.
// DISPUTED land farmers (FRM-0010, 0025): NOT_ELIGIBLE for DEMO_SCHEME_B.
export const entitlementRows = [
  { id: "ENT-0001", farmer_id: "FRM-0001", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0002", farmer_id: "FRM-0001", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0003", farmer_id: "FRM-0001", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0004", farmer_id: "FRM-0002", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0005", farmer_id: "FRM-0002", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0006", farmer_id: "FRM-0002", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0007", farmer_id: "FRM-0003", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0008", farmer_id: "FRM-0003", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0009", farmer_id: "FRM-0003", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0010", farmer_id: "FRM-0004", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0011", farmer_id: "FRM-0004", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0012", farmer_id: "FRM-0004", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0013", farmer_id: "FRM-0005", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0014", farmer_id: "FRM-0005", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0015", farmer_id: "FRM-0005", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0016", farmer_id: "FRM-0006", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0017", farmer_id: "FRM-0006", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 5000, last_payment_on: "2026-05-15", status: "PENDING" },
  { id: "ENT-0018", farmer_id: "FRM-0006", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0019", farmer_id: "FRM-0007", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0020", farmer_id: "FRM-0007", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0021", farmer_id: "FRM-0007", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0022", farmer_id: "FRM-0008", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0023", farmer_id: "FRM-0008", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0024", farmer_id: "FRM-0008", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0025", farmer_id: "FRM-0009", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0026", farmer_id: "FRM-0009", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0027", farmer_id: "FRM-0009", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0028", farmer_id: "FRM-0010", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0029", farmer_id: "FRM-0010", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0030", farmer_id: "FRM-0010", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0031", farmer_id: "FRM-0011", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0032", farmer_id: "FRM-0011", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0033", farmer_id: "FRM-0011", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0034", farmer_id: "FRM-0012", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0035", farmer_id: "FRM-0012", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0036", farmer_id: "FRM-0012", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0037", farmer_id: "FRM-0013", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0038", farmer_id: "FRM-0013", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 6000, last_payment_on: "2026-05-15", status: "PENDING" },
  { id: "ENT-0039", farmer_id: "FRM-0013", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0040", farmer_id: "FRM-0014", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0041", farmer_id: "FRM-0014", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0042", farmer_id: "FRM-0014", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0043", farmer_id: "FRM-0015", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0044", farmer_id: "FRM-0015", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0045", farmer_id: "FRM-0015", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0046", farmer_id: "FRM-0016", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0047", farmer_id: "FRM-0016", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0048", farmer_id: "FRM-0016", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0049", farmer_id: "FRM-0017", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0050", farmer_id: "FRM-0017", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0051", farmer_id: "FRM-0017", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0052", farmer_id: "FRM-0018", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0053", farmer_id: "FRM-0018", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0054", farmer_id: "FRM-0018", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0055", farmer_id: "FRM-0019", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0056", farmer_id: "FRM-0019", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0057", farmer_id: "FRM-0019", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0058", farmer_id: "FRM-0020", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0059", farmer_id: "FRM-0020", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0060", farmer_id: "FRM-0020", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0061", farmer_id: "FRM-0021", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0062", farmer_id: "FRM-0021", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0063", farmer_id: "FRM-0021", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0064", farmer_id: "FRM-0022", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0065", farmer_id: "FRM-0022", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0066", farmer_id: "FRM-0022", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0067", farmer_id: "FRM-0023", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0068", farmer_id: "FRM-0023", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0069", farmer_id: "FRM-0023", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0070", farmer_id: "FRM-0024", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0071", farmer_id: "FRM-0024", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 1, amount_due: 10000, amount_paid: 10000, last_payment_on: "2026-05-15", status: "PAID" },
  { id: "ENT-0072", farmer_id: "FRM-0024", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 4000, last_payment_on: "2026-06-20", status: "PAID" },
  { id: "ENT-0073", farmer_id: "FRM-0025", scheme_code: "DEMO_SCHEME_A", scheme_name: "DEMO_SCHEME_A (Illustrative)", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2026-04-10", status: "PAID" },
  { id: "ENT-0074", farmer_id: "FRM-0025", scheme_code: "DEMO_SCHEME_B", scheme_name: "DEMO_SCHEME_B (Illustrative)", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "NOT_ELIGIBLE" },
  { id: "ENT-0075", farmer_id: "FRM-0025", scheme_code: "DEMO_SCHEME_C", scheme_name: "DEMO_SCHEME_C (Illustrative)", eligible: 1, amount_due: 4000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
];

/**
 * Inserts all synthetic entitlement rows into the entitlements table inside one transaction.
 * Farmers must already exist (foreign key farmer_id references farmers.id).
 *
 * @param {import("better-sqlite3").Database} db - An open better-sqlite3 connection.
 * @returns {number} Number of rows inserted.
 */
export function insertEntitlements(db) {
  const insert = db.prepare(
    `INSERT INTO entitlements (
      id, farmer_id, scheme_code, scheme_name, eligible,
      amount_due, amount_paid, last_payment_on, status
    ) VALUES (
      @id, @farmer_id, @scheme_code, @scheme_name, @eligible,
      @amount_due, @amount_paid, @last_payment_on, @status
    )`
  );

  const insertAll = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
    return rows.length;
  });

  return insertAll(entitlementRows);
}