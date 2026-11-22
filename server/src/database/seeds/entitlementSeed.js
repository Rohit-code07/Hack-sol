// SYNTHETIC DEMO DATA. Not real farmer, land or bank record.
// Scheme names are demo labels.

// 35 entitlements (ENT-0001 to ENT-0035), all farmer_id values in FRM-0001..FRM-0025
// ENT-0001..ENT-0025: DEMO-PMK (one per farmer)
// ENT-0026..ENT-0035: DEMO-CROPINS (10 farmers)
//
// Intentional test cases:
// a) Payment to INACTIVE / ineligible farmers: ENT-0009 (FRM-0009), ENT-0017 (FRM-0017)
// b) Overpayment (paid > due): ENT-0019 (FRM-0019)
// c) Pending or partial payments: ENT-0004, ENT-0008, ENT-0011, ENT-0013, ENT-0020
// d) On hold (disputed land): ENT-0010 (FRM-0010), ENT-0025 (FRM-0025)
// e) Rejected: ENT-0023 (FRM-0023)
export const entitlementRows = [
  { id: "ENT-0001", farmer_id: "FRM-0001", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0002", farmer_id: "FRM-0002", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0003", farmer_id: "FRM-0003", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0004", farmer_id: "FRM-0004", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0005", farmer_id: "FRM-0005", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0006", farmer_id: "FRM-0006", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0007", farmer_id: "FRM-0007", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0008", farmer_id: "FRM-0008", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 4000, last_payment_on: "2025-04-02", status: "PARTIAL" },
  { id: "ENT-0009", farmer_id: "FRM-0009", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 0, amount_due: 0, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0010", farmer_id: "FRM-0010", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 0, last_payment_on: null, status: "ON_HOLD" },
  { id: "ENT-0011", farmer_id: "FRM-0011", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0012", farmer_id: "FRM-0012", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0013", farmer_id: "FRM-0013", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 4000, last_payment_on: "2025-04-02", status: "PARTIAL" },
  { id: "ENT-0014", farmer_id: "FRM-0014", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0015", farmer_id: "FRM-0015", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0016", farmer_id: "FRM-0016", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0017", farmer_id: "FRM-0017", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 0, amount_due: 0, amount_paid: 4000, last_payment_on: "2025-04-02", status: "PAID" },
  { id: "ENT-0018", farmer_id: "FRM-0018", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0019", farmer_id: "FRM-0019", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 8000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0020", farmer_id: "FRM-0020", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0021", farmer_id: "FRM-0021", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0022", farmer_id: "FRM-0022", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0023", farmer_id: "FRM-0023", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "REJECTED" },
  { id: "ENT-0024", farmer_id: "FRM-0024", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 1, amount_due: 6000, amount_paid: 6000, last_payment_on: "2025-08-02", status: "PAID" },
  { id: "ENT-0025", farmer_id: "FRM-0025", scheme_code: "DEMO-PMK", scheme_name: "Demo Farmer Income Support", eligible: 0, amount_due: 0, amount_paid: 0, last_payment_on: null, status: "ON_HOLD" },
  { id: "ENT-0026", farmer_id: "FRM-0001", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 18000, amount_paid: 18000, last_payment_on: "2025-02-14", status: "PAID" },
  { id: "ENT-0027", farmer_id: "FRM-0003", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 9500.5, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0028", farmer_id: "FRM-0005", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 22000, amount_paid: 22000, last_payment_on: "2025-02-14", status: "PAID" },
  { id: "ENT-0029", farmer_id: "FRM-0007", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 12000, amount_paid: 6000, last_payment_on: "2025-02-14", status: "PARTIAL" },
  { id: "ENT-0030", farmer_id: "FRM-0010", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 30000, amount_paid: 30000, last_payment_on: "2025-02-14", status: "PAID" },
  { id: "ENT-0031", farmer_id: "FRM-0012", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 8000, amount_paid: 8000, last_payment_on: "2025-02-14", status: "PAID" },
  { id: "ENT-0032", farmer_id: "FRM-0015", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 15000, amount_paid: 0, last_payment_on: null, status: "PENDING" },
  { id: "ENT-0033", farmer_id: "FRM-0018", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 40000, amount_paid: 40000, last_payment_on: "2025-02-14", status: "PAID" },
  { id: "ENT-0034", farmer_id: "FRM-0021", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 11000, amount_paid: 11000, last_payment_on: "2025-02-14", status: "PAID" },
  { id: "ENT-0035", farmer_id: "FRM-0024", scheme_code: "DEMO-CROPINS", scheme_name: "Demo Crop Insurance Claim", eligible: 1, amount_due: 14500, amount_paid: 14500, last_payment_on: "2025-02-14", status: "PAID" },
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