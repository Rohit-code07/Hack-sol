// SYNTHETIC DEMO DATA. Not real farmer, land or bank record.

// 10 grievances (GRV-0001 to GRV-0010), all farmer_id values in FRM-0001..FRM-0025
// Status mix: 4 OPEN, 3 IN_REVIEW, 3 RESOLVED
export const grievanceRows = [
  { id: "GRV-0001", reference_number: "GRV-2025-0001", farmer_id: "FRM-0004", category: "PAYMENT_DELAY", description: "Income support installment not received for the current cycle.", status: "OPEN" },
  { id: "GRV-0002", reference_number: "GRV-2025-0002", farmer_id: "FRM-0011", category: "PAYMENT_DELAY", description: "Payment still pending even though eligibility is confirmed.", status: "OPEN" },
  { id: "GRV-0003", reference_number: "GRV-2025-0003", farmer_id: "FRM-0003", category: "LAND_RECORD_ERROR", description: "Land record shows father's name as the registered owner.", status: "IN_REVIEW" },
  { id: "GRV-0004", reference_number: "GRV-2025-0004", farmer_id: "FRM-0007", category: "LAND_RECORD_ERROR", description: "Owner name on survey SRV-303/1 does not match the applicant.", status: "IN_REVIEW" },
  { id: "GRV-0005", reference_number: "GRV-2025-0005", farmer_id: "FRM-0010", category: "ELIGIBILITY", description: "Payment put on hold because of a disputed land record.", status: "IN_REVIEW" },
  { id: "GRV-0006", reference_number: "GRV-2025-0006", farmer_id: "FRM-0020", category: "PAYMENT_DELAY", description: "Installment pending for more than two cycles.", status: "OPEN" },
  { id: "GRV-0007", reference_number: "GRV-2025-0007", farmer_id: "FRM-0013", category: "BANK_DETAILS", description: "Partial amount credited, remaining amount not received.", status: "OPEN" },
  { id: "GRV-0008", reference_number: "GRV-2025-0008", farmer_id: "FRM-0015", category: "LAND_RECORD_ERROR", description: "Registered owner name corrected after the request.", status: "RESOLVED" },
  { id: "GRV-0009", reference_number: "GRV-2025-0009", farmer_id: "FRM-0002", category: "OTHER", description: "Request to update the village name in the profile.", status: "RESOLVED" },
  { id: "GRV-0010", reference_number: "GRV-2025-0010", farmer_id: "FRM-0021", category: "BANK_DETAILS", description: "Bank account details updated and confirmed.", status: "RESOLVED" },
];

/**
 * Inserts all synthetic grievance rows into the grievances table inside one transaction.
 * created_at is not set, so the column default is used.
 * Farmers must already exist (foreign key farmer_id references farmers.id).
 *
 * @param {import("better-sqlite3").Database} db - An open better-sqlite3 connection.
 * @returns {number} Number of rows inserted.
 */
export function insertGrievances(db) {
  const insert = db.prepare(
    `INSERT INTO grievances (
      id, reference_number, farmer_id, category, description, status
    ) VALUES (
      @id, @reference_number, @farmer_id, @category, @description, @status
    )`
  );

  const insertAll = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
    return rows.length;
  });

  return insertAll(grievanceRows);
}