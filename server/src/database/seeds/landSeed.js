// SYNTHETIC DEMO DATA. Not real farmer, land or bank record.
// Survey numbers are made-up demo values.

// 35 land records (LND-0001 to LND-0035), all farmer_id values in FRM-0001..FRM-0025
// 10 farmers have 2 records: FRM-0001, 0003, 0005, 0007, 0010, 0012, 0015, 0018, 0021, 0024
// 15 farmers have 1 record
//
// Intentional test cases:
// a) OWNER_NAME_MISMATCH (5 records): LND-0005, LND-0011, LND-0022, LND-0031, LND-0034
// b) DUPLICATE_SURVEY: "SRV-101/2" is held by FRM-0002 (LND-0003) and FRM-0021 (LND-0030)
// c) DISPUTED (2 records): LND-0015, LND-0035
// All other records are clean (owner name matches farmer name, area between 0.4 and 6.0 ha).
export const landRows = [
  { id: "LND-0001", farmer_id: "FRM-0001", survey_number: "SRV-101/1", area_hectares: 2.4, registered_owner_name: "Ramesh Patil", ownership_status: "OWNED", crop_type: "Soybean" },
  { id: "LND-0002", farmer_id: "FRM-0001", survey_number: "SRV-102/3", area_hectares: 1.2, registered_owner_name: "Ramesh Patil", ownership_status: "OWNED", crop_type: "Cotton" },
  { id: "LND-0003", farmer_id: "FRM-0002", survey_number: "SRV-101/2", area_hectares: 3.1, registered_owner_name: "Sunita Deshmukh", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0004", farmer_id: "FRM-0003", survey_number: "SRV-103/1", area_hectares: 0.8, registered_owner_name: "Mahesh Wankhede", ownership_status: "OWNED", crop_type: "Pulses" },
  { id: "LND-0005", farmer_id: "FRM-0003", survey_number: "SRV-104/2", area_hectares: 1.6, registered_owner_name: "Bhimrao Wankhede", ownership_status: "OWNED", crop_type: "Soybean" },
  { id: "LND-0006", farmer_id: "FRM-0004", survey_number: "SRV-201/1", area_hectares: 4.5, registered_owner_name: "Anita Shinde", ownership_status: "OWNED", crop_type: "Sugarcane" },
  { id: "LND-0007", farmer_id: "FRM-0005", survey_number: "SRV-202/4", area_hectares: 2.2, registered_owner_name: "Ganesh Jadhav", ownership_status: "OWNED", crop_type: "Sugarcane" },
  { id: "LND-0008", farmer_id: "FRM-0005", survey_number: "SRV-203/2", area_hectares: 0.9, registered_owner_name: "Ganesh Jadhav", ownership_status: "LEASED", crop_type: "Wheat" },
  { id: "LND-0009", farmer_id: "FRM-0006", survey_number: "SRV-301/1", area_hectares: 1.8, registered_owner_name: "Kavita Pawar", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0010", farmer_id: "FRM-0007", survey_number: "SRV-302/2", area_hectares: 2.75, registered_owner_name: "Vijay Gaikwad", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0011", farmer_id: "FRM-0007", survey_number: "SRV-303/1", area_hectares: 1.1, registered_owner_name: "Dnyaneshwar Gaikwad", ownership_status: "OWNED", crop_type: "Pulses" },
  { id: "LND-0012", farmer_id: "FRM-0008", survey_number: "SRV-401/2", area_hectares: 3.4, registered_owner_name: "Prakash Kale", ownership_status: "OWNED", crop_type: "Cotton" },
  { id: "LND-0013", farmer_id: "FRM-0009", survey_number: "SRV-402/1", area_hectares: 1.5, registered_owner_name: "Meena Bhosale", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0014", farmer_id: "FRM-0010", survey_number: "SRV-501/1", area_hectares: 5.2, registered_owner_name: "Sanjay Chavan", ownership_status: "OWNED", crop_type: "Sugarcane" },
  { id: "LND-0015", farmer_id: "FRM-0010", survey_number: "SRV-502/3", area_hectares: 2.0, registered_owner_name: "Sanjay Chavan", ownership_status: "DISPUTED", crop_type: "Pulses" },
  { id: "LND-0016", farmer_id: "FRM-0011", survey_number: "SRV-503/2", area_hectares: 0.6, registered_owner_name: "Lata Kamble", ownership_status: "OWNED", crop_type: "Pulses" },
  { id: "LND-0017", farmer_id: "FRM-0012", survey_number: "SRV-601/1", area_hectares: 1.4, registered_owner_name: "Rajesh Yadav", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0018", farmer_id: "FRM-0012", survey_number: "SRV-602/2", area_hectares: 0.7, registered_owner_name: "Rajesh Yadav", ownership_status: "LEASED", crop_type: "Rice" },
  { id: "LND-0019", farmer_id: "FRM-0013", survey_number: "SRV-603/1", area_hectares: 1.0, registered_owner_name: "Sushila Verma", ownership_status: "OWNED", crop_type: "Rice" },
  { id: "LND-0020", farmer_id: "FRM-0014", survey_number: "SRV-604/5", area_hectares: 2.3, registered_owner_name: "Mohammad Irfan", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0021", farmer_id: "FRM-0015", survey_number: "SRV-701/1", area_hectares: 3.6, registered_owner_name: "Dinesh Mishra", ownership_status: "OWNED", crop_type: "Rice" },
  { id: "LND-0022", farmer_id: "FRM-0015", survey_number: "SRV-702/2", area_hectares: 1.3, registered_owner_name: "Kailash Mishra", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0023", farmer_id: "FRM-0016", survey_number: "SRV-703/1", area_hectares: 0.5, registered_owner_name: "Geeta Maurya", ownership_status: "OWNED", crop_type: "Pulses" },
  { id: "LND-0024", farmer_id: "FRM-0017", survey_number: "SRV-704/3", area_hectares: 1.9, registered_owner_name: "Suresh Kushwaha", ownership_status: "OWNED", crop_type: "Rice" },
  { id: "LND-0025", farmer_id: "FRM-0018", survey_number: "SRV-801/1", area_hectares: 6.0, registered_owner_name: "Anil Tyagi", ownership_status: "OWNED", crop_type: "Sugarcane" },
  { id: "LND-0026", farmer_id: "FRM-0018", survey_number: "SRV-802/2", area_hectares: 2.6, registered_owner_name: "Anil Tyagi", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0027", farmer_id: "FRM-0019", survey_number: "SRV-803/1", area_hectares: 1.7, registered_owner_name: "Poonam Singh", ownership_status: "OWNED", crop_type: "Sugarcane" },
  { id: "LND-0028", farmer_id: "FRM-0020", survey_number: "SRV-804/4", area_hectares: 0.4, registered_owner_name: "Sohan Lal", ownership_status: "OWNED", crop_type: "Pulses" },
  { id: "LND-0029", farmer_id: "FRM-0021", survey_number: "SRV-901/1", area_hectares: 2.1, registered_owner_name: "Harish Chaudhary", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0030", farmer_id: "FRM-0021", survey_number: "SRV-101/2", area_hectares: 1.25, registered_owner_name: "Harish Chaudhary", ownership_status: "OWNED", crop_type: "Rice" },
  { id: "LND-0031", farmer_id: "FRM-0022", survey_number: "SRV-902/2", area_hectares: 1.05, registered_owner_name: "Omprakash Baghel", ownership_status: "OWNED", crop_type: "Wheat" },
  { id: "LND-0032", farmer_id: "FRM-0023", survey_number: "SRV-903/1", area_hectares: 0.95, registered_owner_name: "Babulal Korku", ownership_status: "OWNED", crop_type: "Soybean" },
  { id: "LND-0033", farmer_id: "FRM-0024", survey_number: "SRV-405/1", area_hectares: 2.8, registered_owner_name: "Savita Rathod", ownership_status: "OWNED", crop_type: "Cotton" },
  { id: "LND-0034", farmer_id: "FRM-0024", survey_number: "SRV-406/2", area_hectares: 1.35, registered_owner_name: "Kisan Rathod", ownership_status: "OWNED", crop_type: "Soybean" },
  { id: "LND-0035", farmer_id: "FRM-0025", survey_number: "SRV-904/1", area_hectares: 1.45, registered_owner_name: "Nandini Gupta", ownership_status: "DISPUTED", crop_type: "Wheat" },
];

/**
 * Inserts all synthetic land records into the land_records table inside one transaction.
 * last_updated is not set, so the column default is used.
 * Farmers must already exist (foreign key farmer_id references farmers.id).
 *
 * @param {import("better-sqlite3").Database} db - An open better-sqlite3 connection.
 * @returns {number} Number of rows inserted.
 */
export function insertLandRecords(db) {
  const insert = db.prepare(
    `INSERT INTO land_records (
      id, farmer_id, survey_number, area_hectares,
      registered_owner_name, ownership_status, crop_type
    ) VALUES (
      @id, @farmer_id, @survey_number, @area_hectares,
      @registered_owner_name, @ownership_status, @crop_type
    )`
  );

  const insertAll = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
    return rows.length;
  });

  return insertAll(landRows);
}