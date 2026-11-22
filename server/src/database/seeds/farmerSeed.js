// SYNTHETIC DEMO DATA. Not real farmer, land or bank record.
// All mobile and bank account values are masked placeholders.
// IFSC codes below are FAKE demo codes (DEMO prefix), not real bank branches.

// 25 farmers (FRM-0001 to FRM-0025)
// 22 ACTIVE, 3 INACTIVE (FRM-0009, FRM-0017, FRM-0023)
export const farmerRows = [
  { id: "FRM-0001", name: "Ramesh Patil", father_name: "Suresh Patil", village: "Kuhi", district: "Nagpur", state: "Maharashtra", mobile_masked: "XXXXXX1021", bank_account_masked: "XXXXXXXX4821", ifsc: "DEMO0000101", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0002", name: "Sunita Deshmukh", father_name: "Vitthal Deshmukh", village: "Katol", district: "Nagpur", state: "Maharashtra", mobile_masked: "XXXXXX1132", bank_account_masked: "XXXXXXXX3377", ifsc: "DEMO0000101", category: "GENERAL", status: "ACTIVE" },
  { id: "FRM-0003", name: "Mahesh Wankhede", father_name: "Bhimrao Wankhede", village: "Umred", district: "Nagpur", state: "Maharashtra", mobile_masked: "XXXXXX1243", bank_account_masked: "XXXXXXXX5589", ifsc: "DEMO0000102", category: "SC", status: "ACTIVE" },
  { id: "FRM-0004", name: "Anita Shinde", father_name: "Dattatray Shinde", village: "Baramati", district: "Pune", state: "Maharashtra", mobile_masked: "XXXXXX1354", bank_account_masked: "XXXXXXXX2214", ifsc: "DEMO0000103", category: "GENERAL", status: "ACTIVE" },
  { id: "FRM-0005", name: "Ganesh Jadhav", father_name: "Pandurang Jadhav", village: "Junnar", district: "Pune", state: "Maharashtra", mobile_masked: "XXXXXX1465", bank_account_masked: "XXXXXXXX6640", ifsc: "DEMO0000103", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0006", name: "Kavita Pawar", father_name: "Raosaheb Pawar", village: "Sinnar", district: "Nashik", state: "Maharashtra", mobile_masked: "XXXXXX1576", bank_account_masked: "XXXXXXXX7712", ifsc: "DEMO0000104", category: "ST", status: "ACTIVE" },
  { id: "FRM-0007", name: "Vijay Gaikwad", father_name: "Shankar Gaikwad", village: "Niphad", district: "Nashik", state: "Maharashtra", mobile_masked: "XXXXXX1687", bank_account_masked: "XXXXXXXX1903", ifsc: "DEMO0000104", category: "SC", status: "ACTIVE" },
  { id: "FRM-0008", name: "Prakash Kale", father_name: "Madhav Kale", village: "Paithan", district: "Aurangabad", state: "Maharashtra", mobile_masked: "XXXXXX1798", bank_account_masked: "XXXXXXXX8456", ifsc: "DEMO0000105", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0009", name: "Meena Bhosale", father_name: "Ramchandra Bhosale", village: "Gangapur", district: "Aurangabad", state: "Maharashtra", mobile_masked: "XXXXXX1809", bank_account_masked: "XXXXXXXX9021", ifsc: "DEMO0000105", category: "GENERAL", status: "INACTIVE" },
  { id: "FRM-0010", name: "Sanjay Chavan", father_name: "Narayan Chavan", village: "Barshi", district: "Solapur", state: "Maharashtra", mobile_masked: "XXXXXX1910", bank_account_masked: "XXXXXXXX4468", ifsc: "DEMO0000106", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0011", name: "Lata Kamble", father_name: "Eknath Kamble", village: "Pandharpur", district: "Solapur", state: "Maharashtra", mobile_masked: "XXXXXX2021", bank_account_masked: "XXXXXXXX3150", ifsc: "DEMO0000106", category: "SC", status: "ACTIVE" },
  { id: "FRM-0012", name: "Rajesh Yadav", father_name: "Hari Yadav", village: "Malihabad", district: "Lucknow", state: "Uttar Pradesh", mobile_masked: "XXXXXX2132", bank_account_masked: "XXXXXXXX7284", ifsc: "DEMO0000107", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0013", name: "Sushila Verma", father_name: "Ramprasad Verma", village: "Bakshi Ka Talab", district: "Lucknow", state: "Uttar Pradesh", mobile_masked: "XXXXXX2243", bank_account_masked: "XXXXXXXX5936", ifsc: "DEMO0000107", category: "SC", status: "ACTIVE" },
  { id: "FRM-0014", name: "Mohammad Irfan", father_name: "Abdul Rashid", village: "Mohanlalganj", district: "Lucknow", state: "Uttar Pradesh", mobile_masked: "XXXXXX2354", bank_account_masked: "XXXXXXXX2678", ifsc: "DEMO0000108", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0015", name: "Dinesh Mishra", father_name: "Kailash Mishra", village: "Chiraigaon", district: "Varanasi", state: "Uttar Pradesh", mobile_masked: "XXXXXX2465", bank_account_masked: "XXXXXXXX8043", ifsc: "DEMO0000108", category: "GENERAL", status: "ACTIVE" },
  { id: "FRM-0016", name: "Geeta Maurya", father_name: "Bhola Maurya", village: "Pindra", district: "Varanasi", state: "Uttar Pradesh", mobile_masked: "XXXXXX2576", bank_account_masked: "XXXXXXXX1597", ifsc: "DEMO0000109", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0017", name: "Suresh Kushwaha", father_name: "Ramlal Kushwaha", village: "Rohaniya", district: "Varanasi", state: "Uttar Pradesh", mobile_masked: "XXXXXX2687", bank_account_masked: "XXXXXXXX6325", ifsc: "DEMO0000109", category: "OBC", status: "INACTIVE" },
  { id: "FRM-0018", name: "Anil Tyagi", father_name: "Satpal Tyagi", village: "Mawana", district: "Meerut", state: "Uttar Pradesh", mobile_masked: "XXXXXX2798", bank_account_masked: "XXXXXXXX4710", ifsc: "DEMO0000110", category: "GENERAL", status: "ACTIVE" },
  { id: "FRM-0019", name: "Poonam Singh", father_name: "Jagdish Singh", village: "Hastinapur", district: "Meerut", state: "Uttar Pradesh", mobile_masked: "XXXXXX2809", bank_account_masked: "XXXXXXXX9182", ifsc: "DEMO0000110", category: "GENERAL", status: "ACTIVE" },
  { id: "FRM-0020", name: "Sohan Lal", father_name: "Ramdhan", village: "Sardhana", district: "Meerut", state: "Uttar Pradesh", mobile_masked: "XXXXXX2910", bank_account_masked: "XXXXXXXX3864", ifsc: "DEMO0000111", category: "SC", status: "ACTIVE" },
  { id: "FRM-0021", name: "Harish Chaudhary", father_name: "Mukesh Chaudhary", village: "Kiraoli", district: "Agra", state: "Uttar Pradesh", mobile_masked: "XXXXXX3021", bank_account_masked: "XXXXXXXX2549", ifsc: "DEMO0000111", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0022", name: "Rekha Baghel", father_name: "Omprakash Baghel", village: "Fatehabad", district: "Agra", state: "Uttar Pradesh", mobile_masked: "XXXXXX3132", bank_account_masked: "XXXXXXXX7601", ifsc: "DEMO0000112", category: "OBC", status: "ACTIVE" },
  { id: "FRM-0023", name: "Babulal Korku", father_name: "Mohan Korku", village: "Ramtek", district: "Nagpur", state: "Maharashtra", mobile_masked: "XXXXXX3243", bank_account_masked: "XXXXXXXX1128", ifsc: "DEMO0000101", category: "ST", status: "INACTIVE" },
  { id: "FRM-0024", name: "Savita Rathod", father_name: "Kisan Rathod", village: "Soegaon", district: "Aurangabad", state: "Maharashtra", mobile_masked: "XXXXXX3354", bank_account_masked: "XXXXXXXX5473", ifsc: "DEMO0000105", category: "ST", status: "ACTIVE" },
  { id: "FRM-0025", name: "Nandini Gupta", father_name: "Rajkumar Gupta", village: "Bah", district: "Agra", state: "Uttar Pradesh", mobile_masked: "XXXXXX3465", bank_account_masked: "XXXXXXXX8890", ifsc: "DEMO0000112", category: "GENERAL", status: "ACTIVE" },
];

/**
 * Inserts all synthetic farmer rows into the farmers table inside one transaction.
 * created_at is not set, so the column default is used.
 *
 * @param {import("better-sqlite3").Database} db - An open better-sqlite3 connection.
 * @returns {number} Number of rows inserted.
 */
export function insertFarmers(db) {
  const insert = db.prepare(
    `INSERT INTO farmers (
      id, name, father_name, village, district, state,
      mobile_masked, bank_account_masked, ifsc, category, status
    ) VALUES (
      @id, @name, @father_name, @village, @district, @state,
      @mobile_masked, @bank_account_masked, @ifsc, @category, @status
    )`
  );

  const insertAll = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
    return rows.length;
  });

  return insertAll(farmerRows);
}