// SYNTHETIC DEMO DATA. Not real farmer, land or bank record.

// 5 grievances (GRV-0001 to GRV-0005) for FRM-0002, 0005, 0008, 0012, 0019.
// Status mix: 2 OPEN, 2 IN_REVIEW, 1 RESOLVED.
export const grievanceRows = [
  {
    id: "GRV-0001",
    reference_number: "KS-GRV-2026-000001",
    farmer_id: "FRM-0002",
    category: "WRONG_LAND_RECORD",
    description:
      "Mere khet ka survey number SRV-101/2 ek aur kisan ke record mein bhi dikh raha hai. Kripya land record ki jaanch karke sudhar karein.",
    status: "IN_REVIEW",
  },
  {
    id: "GRV-0002",
    reference_number: "KS-GRV-2026-000002",
    farmer_id: "FRM-0005",
    category: "ENTITLEMENT_NOT_RECEIVED",
    description:
      "DEMO_SCHEME_A ki raashi abhi tak mere bank account mein nahi aayi hai, jabki baaki schemes ka paisa mil chuka hai. Kripya status check karein.",
    status: "OPEN",
  },
  {
    id: "GRV-0003",
    reference_number: "KS-GRV-2026-000003",
    farmer_id: "FRM-0008",
    category: "ENTITLEMENT_NOT_RECEIVED",
    description:
      "DEMO_SCHEME_B shows as pending for me even though my eligibility was confirmed earlier. Please check why the payment has not been released.",
    status: "OPEN",
  },
  {
    id: "GRV-0004",
    reference_number: "KS-GRV-2026-000004",
    farmer_id: "FRM-0012",
    category: "LOAN_ISSUE",
    description:
      "The outstanding amount shown for my crop loan does not match my bank passbook entries. I request a verification of the loan record.",
    status: "IN_REVIEW",
  },
  {
    id: "GRV-0005",
    reference_number: "KS-GRV-2026-000005",
    farmer_id: "FRM-0019",
    category: "OTHER",
    description:
      "Mera mobile number profile mein purana dikh raha hai. Kripya naya number update kar dein taaki SMS alerts sahi number par aayein.",
    status: "RESOLVED",
  },
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