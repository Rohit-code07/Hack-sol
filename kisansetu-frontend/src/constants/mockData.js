// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.

export const farmers = [
  {
    id: "FRM-0001",
    name: "Balwant Singh",
    fatherName: "Harnam Singh",
    village: "Bhogpur",
    district: "Meerut",
    state: "Uttar Pradesh",
    mobileMasked: "XXXXXX7812",
    bankAccountMasked: "XXXX XXXX 4190",
    category: "GENERAL",
    status: "ACTIVE"
  },
  {
    id: "FRM-0002",
    name: "Sunil Baburao Patil",
    fatherName: "Baburao Patil",
    village: "Sevagram",
    district: "Wardha",
    state: "Maharashtra",
    mobileMasked: "XXXXXX9201",
    bankAccountMasked: "XXXX XXXX 8832",
    category: "OBC",
    status: "ACTIVE"
  },
  {
    id: "FRM-0003",
    name: "Ramesh Kumar",
    fatherName: "Dayaram Kumar",
    village: "Chandrapur Khurd",
    district: "Wardha",
    state: "Maharashtra",
    mobileMasked: "XXXXXX1234",
    bankAccountMasked: "XXXX XXXX 5678",
    category: "OBC",
    status: "ACTIVE"
  },
  {
    id: "FRM-0004",
    name: "Rajeshwar Shinde",
    fatherName: "Eknath Shinde",
    village: "Deoli",
    district: "Wardha",
    state: "Maharashtra",
    mobileMasked: "XXXXXX3489",
    bankAccountMasked: "XXXX XXXX 1029",
    category: "GENERAL",
    status: "ACTIVE"
  },
  {
    id: "FRM-0005",
    name: "Devendra Gautam",
    fatherName: "Ramswaroop Gautam",
    village: "Barabanki Dehat",
    district: "Barabanki",
    state: "Uttar Pradesh",
    mobileMasked: "XXXXXX6621",
    bankAccountMasked: "XXXX XXXX 7741",
    category: "SC",
    status: "ACTIVE"
  },
  {
    id: "FRM-0006",
    name: "Vithalrao Gawande",
    fatherName: "Namdeorao Gawande",
    village: "Kalamb",
    district: "Yavatmal",
    state: "Maharashtra",
    mobileMasked: "XXXXXX4510",
    bankAccountMasked: "XXXX XXXX 2390",
    category: "ST",
    status: "ACTIVE"
  },
  {
    id: "FRM-0007",
    name: "Anand Prakash Yadav",
    fatherName: "Mata Prasad Yadav",
    village: "Mohanlalganj",
    district: "Lucknow",
    state: "Uttar Pradesh",
    mobileMasked: "XXXXXX8912",
    bankAccountMasked: "XXXX XXXX 6543",
    category: "OBC",
    status: "ACTIVE"
  },
  {
    id: "FRM-0008",
    name: "Prakash Sakharam More",
    fatherName: "Sakharam More",
    village: "Ghatanji",
    district: "Yavatmal",
    state: "Maharashtra",
    mobileMasked: "XXXXXX5523",
    bankAccountMasked: "XXXX XXXX 9912",
    category: "SC",
    status: "INACTIVE"
  },
  {
    id: "FRM-0009",
    name: "Kailash Chand Verma",
    fatherName: "Jagdish Verma",
    village: "Banthra",
    district: "Lucknow",
    state: "Uttar Pradesh",
    mobileMasked: "XXXXXX1190",
    bankAccountMasked: "XXXX XXXX 3381",
    category: "OBC",
    status: "ACTIVE"
  },
  {
    id: "FRM-0010",
    name: "Archana Ramesh Dhote",
    fatherName: "Ramesh Dhote",
    village: "Arvi",
    district: "Wardha",
    state: "Maharashtra",
    mobileMasked: "XXXXXX7702",
    bankAccountMasked: "XXXX XXXX 5567",
    category: "GENERAL",
    status: "ACTIVE"
  }
];

export const landRecords = [
  {
    id: "LND-1001",
    farmerId: "FRM-0003",
    surveyNumber: "74/2A",
    areaHectares: 2.5,
    registeredOwnerName: "Ramesh Dayaram Kumar",
    ownershipStatus: "OWNED",
    cropType: "Soybean"
  },
  {
    id: "LND-1002",
    farmerId: "FRM-0003",
    surveyNumber: "102/1",
    areaHectares: 2.0,
    registeredOwnerName: "Ramesh Dayaram (Spelling Mismatch)",
    ownershipStatus: "OWNED",
    cropType: "Cotton"
  },
  {
    id: "LND-1003",
    farmerId: "FRM-0001",
    surveyNumber: "74/2A", // Duplicate survey cross-reference
    areaHectares: 1.8,
    registeredOwnerName: "Balwant Singh",
    ownershipStatus: "DISPUTED",
    cropType: "Wheat"
  },
  {
    id: "LND-1004",
    farmerId: "FRM-0001",
    surveyNumber: "15/4",
    areaHectares: 3.2,
    registeredOwnerName: "Balwant Singh",
    ownershipStatus: "OWNED",
    cropType: "Sugarcane"
  },
  {
    id: "LND-1005",
    farmerId: "FRM-0002",
    surveyNumber: "88/3B",
    areaHectares: 3.0,
    registeredOwnerName: "Sunil Baburao Patil",
    ownershipStatus: "OWNED",
    cropType: "Soybean"
  },
  {
    id: "LND-1006",
    farmerId: "FRM-0004",
    surveyNumber: "91/1",
    areaHectares: 4.0,
    registeredOwnerName: "Rajeshwar Eknath Shinde",
    ownershipStatus: "OWNED",
    cropType: "Cotton"
  },
  {
    id: "LND-1007",
    farmerId: "FRM-0005",
    surveyNumber: "142/6",
    areaHectares: 1.5,
    registeredOwnerName: "Ramswaroop Gautam (Deceased)",
    ownershipStatus: "DISPUTED",
    cropType: "Rice"
  },
  {
    id: "LND-1008",
    farmerId: "FRM-0006",
    surveyNumber: "33/A",
    areaHectares: 2.2,
    registeredOwnerName: "Vithalrao Gawande",
    ownershipStatus: "OWNED",
    cropType: "Pulses"
  },
  {
    id: "LND-1009",
    farmerId: "FRM-0007",
    surveyNumber: "51/2",
    areaHectares: 2.8,
    registeredOwnerName: "Anand Prakash Yadav",
    ownershipStatus: "OWNED",
    cropType: "Wheat"
  },
  {
    id: "LND-1010",
    farmerId: "FRM-0007",
    surveyNumber: "52/1",
    areaHectares: 1.2,
    registeredOwnerName: "Mata Prasad Yadav",
    ownershipStatus: "LEASED",
    cropType: "Pulses"
  },
  {
    id: "LND-1011",
    farmerId: "FRM-0008",
    surveyNumber: "120/4",
    areaHectares: 2.0,
    registeredOwnerName: "Prakash More",
    ownershipStatus: "OWNED",
    cropType: "Cotton"
  },
  {
    id: "LND-1012",
    farmerId: "FRM-0009",
    surveyNumber: "204/1A",
    areaHectares: 3.5,
    registeredOwnerName: "Kailash Chand Verma",
    ownershipStatus: "OWNED",
    cropType: "Rice"
  },
  {
    id: "LND-1013",
    farmerId: "FRM-0009",
    surveyNumber: "205/3",
    areaHectares: 1.0,
    registeredOwnerName: "Kailash Chand Verma",
    ownershipStatus: "OWNED",
    cropType: "Wheat"
  },
  {
    id: "LND-1014",
    farmerId: "FRM-0010",
    surveyNumber: "67/12",
    areaHectares: 1.9,
    registeredOwnerName: "Archana Ramesh Dhote",
    ownershipStatus: "OWNED",
    cropType: "Soybean"
  },
  {
    id: "LND-1015",
    farmerId: "FRM-0002",
    surveyNumber: "89/1",
    areaHectares: 1.4,
    registeredOwnerName: "Govind Patil (Brother)",
    ownershipStatus: "LEASED",
    cropType: "Pulses"
  }
];

export const loans = [
  {
    id: "LN-2024-001",
    farmerId: "FRM-0003",
    bankName: "Bank of Maharashtra (Wardha Branch)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 160000,
    outstandingAmount: 95000,
    loanStatus: "NPA", // NPA > 40% (95000 / 160000 = 59.3%)
    disbursedOn: "2023-06-15"
  },
  {
    id: "LN-2025-002",
    farmerId: "FRM-0003",
    bankName: "Wardha District Central Co-op Bank",
    loanType: "Drip Irrigation Term Loan",
    sanctionedAmount: 50000,
    outstandingAmount: 22000,
    loanStatus: "ACTIVE",
    disbursedOn: "2024-01-10"
  },
  {
    id: "LN-2022-003",
    farmerId: "FRM-0001",
    bankName: "Punjab National Bank (Meerut Branch)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 200000,
    outstandingAmount: 0,
    loanStatus: "CLOSED",
    disbursedOn: "2022-04-12"
  },
  {
    id: "LN-2024-004",
    farmerId: "FRM-0001",
    bankName: "Punjab National Bank (Meerut Branch)",
    loanType: "Tractor Financing Loan",
    sanctionedAmount: 450000,
    outstandingAmount: 210000,
    loanStatus: "ACTIVE",
    disbursedOn: "2024-02-18"
  },
  {
    id: "LN-2023-005",
    farmerId: "FRM-0002",
    bankName: "State Bank of India (Sevagram)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 180000,
    outstandingAmount: 64000,
    loanStatus: "ACTIVE",
    disbursedOn: "2023-07-04"
  },
  {
    id: "LN-2023-006",
    farmerId: "FRM-0004",
    bankName: "Bank of Baroda (Deoli)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 220000,
    outstandingAmount: 130000,
    loanStatus: "NPA", // 59% outstanding
    disbursedOn: "2023-05-19"
  },
  {
    id: "LN-2024-007",
    farmerId: "FRM-0005",
    bankName: "Aryavart Bank (Barabanki)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 90000,
    outstandingAmount: 35000,
    loanStatus: "ACTIVE",
    disbursedOn: "2024-03-22"
  },
  {
    id: "LN-2021-008",
    farmerId: "FRM-0006",
    bankName: "Vidarbha Konkan Gramin Bank",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 120000,
    outstandingAmount: 0,
    loanStatus: "CLOSED",
    disbursedOn: "2021-06-11"
  },
  {
    id: "LN-2024-009",
    farmerId: "FRM-0007",
    bankName: "Union Bank of India (Mohanlalganj)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 240000,
    outstandingAmount: 85000,
    loanStatus: "ACTIVE",
    disbursedOn: "2024-05-14"
  },
  {
    id: "LN-2022-010",
    farmerId: "FRM-0008",
    bankName: "Central Bank of India (Yavatmal)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 140000,
    outstandingAmount: 98000,
    loanStatus: "NPA", // 70% outstanding
    disbursedOn: "2022-08-01"
  },
  {
    id: "LN-2023-011",
    farmerId: "FRM-0009",
    bankName: "State Bank of India (Banthra)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 280000,
    outstandingAmount: 110000,
    loanStatus: "ACTIVE",
    disbursedOn: "2023-11-20"
  },
  {
    id: "LN-2024-012",
    farmerId: "FRM-0010",
    bankName: "HDFC Bank (Arvi Branch)",
    loanType: "KCC Crop Loan",
    sanctionedAmount: 130000,
    outstandingAmount: 42000,
    loanStatus: "ACTIVE",
    disbursedOn: "2024-04-05"
  }
];

export const entitlements = [
  // FRM-0001
  { id: "ENT-101", farmerId: "FRM-0001", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: true, amountDue: 24000, amountPaid: 24000, status: "PAID" },
  { id: "ENT-102", farmerId: "FRM-0001", schemeCode: "SCHEME_MSP_BONUS", schemeName: "State Wheat MSP Price Deficit Bonus", eligible: true, amountDue: 18500, amountPaid: 18500, status: "PAID" },
  { id: "ENT-103", farmerId: "FRM-0001", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Crop Weather Insurance Claim", eligible: true, amountDue: 35000, amountPaid: 0, status: "PENDING" },

  // FRM-0002
  { id: "ENT-104", farmerId: "FRM-0002", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: true, amountDue: 18000, amountPaid: 18000, status: "PAID" },
  { id: "ENT-105", farmerId: "FRM-0002", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Soybean Market Deficit Direct Transfer", eligible: true, amountDue: 14200, amountPaid: 14200, status: "PAID" },
  { id: "ENT-106", farmerId: "FRM-0002", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Crop Weather Insurance Claim", eligible: true, amountDue: 28000, amountPaid: 28000, status: "PAID" },

  // FRM-0003 (Hero Ramesh Kumar)
  { id: "ENT-107", farmerId: "FRM-0003", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Interest Subvention (3%)", eligible: false, amountDue: 14800, amountPaid: 0, status: "NOT_ELIGIBLE" }, // Due to NPA
  { id: "ENT-108", farmerId: "FRM-0003", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Soybean Direct Procurement Incentive", eligible: true, amountDue: 22400, amountPaid: 12000, status: "PENDING" },
  { id: "ENT-109", farmerId: "FRM-0003", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Kharif Yield Loss Compensation", eligible: true, amountDue: 42000, amountPaid: 42000, status: "PAID" },

  // FRM-0004
  { id: "ENT-110", farmerId: "FRM-0004", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: false, amountDue: 21000, amountPaid: 0, status: "NOT_ELIGIBLE" },
  { id: "ENT-111", farmerId: "FRM-0004", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Cotton Procurement Bonus", eligible: true, amountDue: 19800, amountPaid: 19800, status: "PAID" },
  { id: "ENT-112", farmerId: "FRM-0004", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Kharif Loss Compensation", eligible: true, amountDue: 31000, amountPaid: 0, status: "PENDING" },

  // FRM-0005
  { id: "ENT-113", farmerId: "FRM-0005", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: true, amountDue: 9500, amountPaid: 9500, status: "PAID" },
  { id: "ENT-114", farmerId: "FRM-0005", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Rice Procurement Price Differential", eligible: true, amountDue: 11200, amountPaid: 11200, status: "PAID" },
  { id: "ENT-115", farmerId: "FRM-0005", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Flooding Indemnity Claim", eligible: true, amountDue: 18000, amountPaid: 0, status: "PENDING" },

  // FRM-0006
  { id: "ENT-116", farmerId: "FRM-0006", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: true, amountDue: 13000, amountPaid: 13000, status: "PAID" },
  { id: "ENT-117", farmerId: "FRM-0006", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Pulses Procurement Incentive", eligible: true, amountDue: 16500, amountPaid: 16500, status: "PAID" },
  { id: "ENT-118", farmerId: "FRM-0006", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Crop Drought Insurance", eligible: true, amountDue: 26000, amountPaid: 26000, status: "PAID" },

  // FRM-0007
  { id: "ENT-119", farmerId: "FRM-0007", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: true, amountDue: 26000, amountPaid: 26000, status: "PAID" },
  { id: "ENT-120", farmerId: "FRM-0007", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Wheat State Bonus", eligible: true, amountDue: 21500, amountPaid: 21500, status: "PAID" },
  { id: "ENT-121", farmerId: "FRM-0007", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Hailstorm Claim Settlement", eligible: true, amountDue: 33000, amountPaid: 33000, status: "PAID" },

  // FRM-0008
  { id: "ENT-122", farmerId: "FRM-0008", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: false, amountDue: 15000, amountPaid: 0, status: "NOT_ELIGIBLE" },
  { id: "ENT-123", farmerId: "FRM-0008", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Cotton Incentive Transfer", eligible: false, amountDue: 12000, amountPaid: 0, status: "NOT_ELIGIBLE" },
  { id: "ENT-124", farmerId: "FRM-0008", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Crop Claim", eligible: false, amountDue: 20000, amountPaid: 0, status: "NOT_ELIGIBLE" },

  // FRM-0009
  { id: "ENT-125", farmerId: "FRM-0009", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: true, amountDue: 31000, amountPaid: 31000, status: "PAID" },
  { id: "ENT-126", farmerId: "FRM-0009", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Paddy Super Bonus", eligible: true, amountDue: 28400, amountPaid: 14200, status: "PENDING" },
  { id: "ENT-127", farmerId: "FRM-0009", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Crop Inundation Claim", eligible: true, amountDue: 45000, amountPaid: 45000, status: "PAID" },

  // FRM-0010
  { id: "ENT-128", farmerId: "FRM-0010", schemeCode: "SCHEME_KCC", schemeName: "Kisan Credit Card Subsidy", eligible: true, amountDue: 14000, amountPaid: 14000, status: "PAID" },
  { id: "ENT-129", farmerId: "FRM-0010", schemeCode: "SCHEME_MSP_BONUS", schemeName: "Soybean Procurement Bonus", eligible: true, amountDue: 15600, amountPaid: 15600, status: "PAID" },
  { id: "ENT-130", farmerId: "FRM-0010", schemeCode: "SCHEME_INSURANCE", schemeName: "PMFBY Pest Attack Relief", eligible: true, amountDue: 24000, amountPaid: 24000, status: "PAID" }
];

export const discrepancies = [
  {
    id: "DISC-001",
    farmerId: "FRM-0003",
    ruleCode: "OWNER_NAME_MISMATCH",
    severity: "HIGH",
    description: "Revenue record for Survey 102/1 registers owner as 'Ramesh Dayaram' whereas bank registry holds 'Ramesh Kumar'.",
    recommendedAction: "Submit revenue mutation endorsement or gazette affidavit to align Bhulekh registry with Aadhaar.",
    detectedAt: "2026-02-14",
    resolved: false
  },
  {
    id: "DISC-002",
    farmerId: "FRM-0003",
    ruleCode: "LOAN_NPA_WITH_SUBSIDY",
    severity: "HIGH",
    description: "KCC loan account LN-2024-001 is classified NPA while central interest subvention claim remains initiated.",
    recommendedAction: "Regularize overdue balance of ₹95,000 to unfreeze subvention eligibility.",
    detectedAt: "2026-02-01",
    resolved: false
  },
  {
    id: "DISC-003",
    farmerId: "FRM-0001",
    ruleCode: "DUPLICATE_SURVEY",
    severity: "HIGH",
    description: "Survey number 74/2A is actively claimed across two distinct farmer profiles (FRM-0001 and FRM-0003).",
    recommendedAction: "Joint revenue patwari demarcation required to resolve duplicate parcel registration.",
    detectedAt: "2026-01-20",
    resolved: false
  },
  {
    id: "DISC-004",
    farmerId: "FRM-0004",
    ruleCode: "AREA_MISMATCH",
    severity: "MEDIUM",
    description: "Sanctioned loan area of 4.8 ha exceeds total verified revenue landholding of 4.0 ha.",
    recommendedAction: "Update bank loan ledger with revised land demarcation extract.",
    detectedAt: "2026-02-10",
    resolved: false
  },
  {
    id: "DISC-005",
    farmerId: "FRM-0005",
    ruleCode: "OWNER_NAME_MISMATCH",
    severity: "HIGH",
    description: "Survey 142/6 is recorded under deceased ancestor 'Ramswaroop Gautam' without formal virasat mutation.",
    recommendedAction: "Complete succession mutation (Virasat Darj) at Tehsil revenue office.",
    detectedAt: "2026-01-15",
    resolved: false
  },
  {
    id: "DISC-006",
    farmerId: "FRM-0008",
    ruleCode: "BANK_ACCOUNT_INACTIVE",
    severity: "MEDIUM",
    description: "Direct Benefit Transfer (DBT) bank account has been flagged dormant for >180 days by nodal clearing house.",
    recommendedAction: "Visit Central Bank of India branch with biometric KYC to reactivate account.",
    detectedAt: "2026-02-18",
    resolved: false
  },
  {
    id: "DISC-007",
    farmerId: "FRM-0007",
    ruleCode: "AREA_MISMATCH",
    severity: "LOW",
    description: "Minor measurement variance of 0.05 ha detected between digital drone survey and cadastral map.",
    recommendedAction: "No immediate action required; variance will reconcile during next village survey update.",
    detectedAt: "2026-01-30",
    resolved: true
  },
  {
    id: "DISC-008",
    farmerId: "FRM-0009",
    ruleCode: "BANK_ACCOUNT_INACTIVE",
    severity: "LOW",
    description: "Minor IFSC routing change following bank merger. Account active but notification pending.",
    recommendedAction: "Confirm updated IFSC code (SBIN000821) at home branch.",
    detectedAt: "2026-02-05",
    resolved: true
  }
];

export const grievances = [
  {
    id: "GRV-001",
    referenceNumber: "KS-GRV-2026-000001",
    farmerId: "FRM-0003",
    category: "WRONG_LAND_RECORD",
    description: "In Survey 102/1 my father's surname was omitted in Bhulekh online entry, creating an automated alert.",
    status: "IN_REVIEW",
    createdAt: "2026-02-15T10:30:00Z"
  },
  {
    id: "GRV-002",
    referenceNumber: "KS-GRV-2026-000002",
    farmerId: "FRM-0001",
    category: "ENTITLEMENT_NOT_RECEIVED",
    description: "PMFBY weather compensation approved for Meerut region has not settled into my PNB account.",
    status: "OPEN",
    createdAt: "2026-02-17T14:15:00Z"
  },
  {
    id: "GRV-003",
    referenceNumber: "KS-GRV-2026-000003",
    farmerId: "FRM-0005",
    category: "WRONG_LAND_RECORD",
    description: "Succession application filed at Tehsil 3 months ago but portal still displays deceased ancestor.",
    status: "OPEN",
    createdAt: "2026-02-19T09:45:00Z"
  },
  {
    id: "GRV-004",
    referenceNumber: "KS-GRV-2026-000004",
    farmerId: "FRM-0007",
    category: "LOAN_ISSUE",
    description: "Interest subvention credit of 3% delayed for previous rabi season crop loan.",
    status: "RESOLVED",
    createdAt: "2026-02-01T11:00:00Z"
  }
];

export const bankApplications = [
  { id: "APP-2026-0001", farmerId: "FRM-0003", type: "KCC_RENEWAL", status: "PENDING", submittedAt: "2026-02-18", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0002", farmerId: "FRM-0001", type: "KCC_NEW", status: "APPROVED", submittedAt: "2026-02-15", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0003", farmerId: "FRM-0002", type: "LOAN_TOPUP", status: "APPROVED", submittedAt: "2026-02-14", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0004", farmerId: "FRM-0004", type: "KCC_RENEWAL", status: "REJECTED", submittedAt: "2026-02-12", reviewedBy: "Meenakshi Iyer" },
  { id: "APP-2026-0005", farmerId: "FRM-0005", type: "KCC_NEW", status: "IN_REVIEW", submittedAt: "2026-02-19", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0006", farmerId: "FRM-0006", type: "LOAN_TOPUP", status: "APPROVED", submittedAt: "2026-02-10", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0007", farmerId: "FRM-0007", type: "KCC_RENEWAL", status: "APPROVED", submittedAt: "2026-02-11", reviewedBy: "Meenakshi Iyer" },
  { id: "APP-2026-0008", farmerId: "FRM-0008", type: "KCC_RENEWAL", status: "REJECTED", submittedAt: "2026-02-09", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0009", farmerId: "FRM-0009", type: "KCC_NEW", status: "APPROVED", submittedAt: "2026-02-08", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0010", farmerId: "FRM-0010", type: "KCC_NEW", status: "IN_REVIEW", submittedAt: "2026-02-19", reviewedBy: "Meenakshi Iyer" },
  { id: "APP-2026-0011", farmerId: "FRM-0003", type: "LOAN_TOPUP", status: "REJECTED", submittedAt: "2026-01-25", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0012", farmerId: "FRM-0002", type: "KCC_RENEWAL", status: "APPROVED", submittedAt: "2026-01-28", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0013", farmerId: "FRM-0001", type: "LOAN_TOPUP", status: "APPROVED", submittedAt: "2026-01-30", reviewedBy: "Meenakshi Iyer" },
  { id: "APP-2026-0014", farmerId: "FRM-0005", type: "KCC_RENEWAL", status: "PENDING", submittedAt: "2026-02-16", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0015", farmerId: "FRM-0006", type: "KCC_NEW", status: "APPROVED", submittedAt: "2026-02-02", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0016", farmerId: "FRM-0007", type: "LOAN_TOPUP", status: "PENDING", submittedAt: "2026-02-17", reviewedBy: "Meenakshi Iyer" },
  { id: "APP-2026-0017", farmerId: "FRM-0004", type: "LOAN_TOPUP", status: "REJECTED", submittedAt: "2026-02-03", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0018", farmerId: "FRM-0009", type: "KCC_RENEWAL", status: "APPROVED", submittedAt: "2026-02-04", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0019", farmerId: "FRM-0010", type: "LOAN_TOPUP", status: "PENDING", submittedAt: "2026-02-18", reviewedBy: "Meenakshi Iyer" },
  { id: "APP-2026-0020", farmerId: "FRM-0003", type: "KCC_NEW", status: "IN_REVIEW", submittedAt: "2026-02-20", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0021", farmerId: "FRM-0001", type: "KCC_RENEWAL", status: "APPROVED", submittedAt: "2026-02-06", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0022", farmerId: "FRM-0002", type: "LOAN_TOPUP", status: "PENDING", submittedAt: "2026-02-19", reviewedBy: "Sunita Verma" },
  { id: "APP-2026-0023", farmerId: "FRM-0007", type: "KCC_NEW", status: "APPROVED", submittedAt: "2026-02-07", reviewedBy: "Meenakshi Iyer" },
  { id: "APP-2026-0024", farmerId: "FRM-0005", type: "LOAN_TOPUP", status: "REJECTED", submittedAt: "2026-02-05", reviewedBy: "Rajesh Khurana" },
  { id: "APP-2026-0025", farmerId: "FRM-0009", type: "LOAN_TOPUP", status: "APPROVED", submittedAt: "2026-02-01", reviewedBy: "Sunita Verma" }
];

export const verificationHistory = [
  {
    id: "VER-001",
    surveyNumber: "74/2A",
    farmerId: "FRM-0003",
    timestamp: "2026-02-20T10:15:00Z",
    verdict: "VERIFIED",
    ownerMatch: true,
    areaMatch: true,
    notes: ["Revenue record exactly matches Aadhaar spelling", "No active ceiling violation flagged"]
  },
  {
    id: "VER-002",
    surveyNumber: "102/1",
    farmerId: "FRM-0003",
    timestamp: "2026-02-20T11:00:00Z",
    verdict: "MISMATCH",
    ownerMatch: false,
    areaMatch: true,
    notes: ["Registered name in Bhulekh is 'Ramesh Dayaram' without surname", "Affidavit required from applicant"]
  },
  {
    id: "VER-003",
    surveyNumber: "74/2A",
    farmerId: "FRM-0001",
    timestamp: "2026-02-19T14:20:00Z",
    verdict: "MISMATCH",
    ownerMatch: false,
    areaMatch: false,
    notes: ["Duplicate claim detected against FRM-0003", "Area discrepancy of 0.70 hectares identified"]
  },
  {
    id: "VER-004",
    surveyNumber: "88/3B",
    farmerId: "FRM-0002",
    timestamp: "2026-02-18T16:45:00Z",
    verdict: "VERIFIED",
    ownerMatch: true,
    areaMatch: true,
    notes: ["Clear ownership title established", "No court stay on record"]
  },
  {
    id: "VER-005",
    surveyNumber: "999/X",
    farmerId: "FRM-0006",
    timestamp: "2026-02-17T09:30:00Z",
    verdict: "NOT_FOUND",
    ownerMatch: false,
    areaMatch: false,
    notes: ["Survey parcel not identified in cadastral registry of Yavatmal"]
  },
  {
    id: "VER-006",
    surveyNumber: "142/6",
    farmerId: "FRM-0005",
    timestamp: "2026-02-16T12:10:00Z",
    verdict: "MISMATCH",
    ownerMatch: false,
    areaMatch: true,
    notes: ["Khata is currently in the name of deceased father", "Succession mutation incomplete"]
  }
];

export const kccRates = {
  Wheat: 45000,
  Rice: 52000,
  Soybean: 38000,
  Cotton: 60000,
  Sugarcane: 95000,
  Pulses: 35000
};

export const mspTable = {
  Wheat: 2275,
  Rice: 2183,
  Soybean: 4600,
  Cotton: 6620,
  Sugarcane: 315,
  Pulses: 6600
};
