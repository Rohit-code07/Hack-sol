/**
 * KisanSetu Universal Smart Form Registry.
 *
 * Defines metadata, aliases, field types, labels (English + Hindi), and validation hints
 * for all forms in the application. Extensible for future forms.
 */

export const FORM_REGISTRY = {
  'farmer-registration': {
    formId: 'farmer-registration',
    formTitle: 'Farmer Registration',
    formTitleHi: 'किसान पंजीकरण',
    description: 'New farmer registration form for personal, land, and crop information.',
    fields: [
      { name: 'name', label: 'Farmer Full Name', labelHi: 'किसान का पूरा नाम', type: 'text', required: true, aliases: ['name', 'full name', 'kisan naam', 'naam'] },
      { name: 'fatherName', label: 'Father / Husband Name', labelHi: 'पिता / पति का नाम', type: 'text', aliases: ['father name', 'husband name', 'pita ka naam', 'pati ka naam'] },
      { name: 'dob', label: 'Date of Birth', labelHi: 'जन्म तिथि', type: 'date', aliases: ['date of birth', 'dob', 'janm tithi'] },
      { name: 'gender', label: 'Gender', labelHi: 'लिंग', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }], aliases: ['gender', 'ling'] },
      { name: 'mobile', label: 'Mobile Number', labelHi: 'मोबाइल नंबर', type: 'phone', required: true, aliases: ['mobile', 'phone', 'contact number', 'mobile number'] },
      { name: 'alternateMobile', label: 'Alternate Mobile', labelHi: 'वैकल्पिक मोबाइल', type: 'phone', aliases: ['alternate phone', 'other mobile'] },
      { name: 'aadhaarNumber', label: 'Aadhaar Number', labelHi: 'आधार नंबर', type: 'aadhaar', sensitive: true, aliases: ['aadhaar', 'uid', 'aadhar number', 'aadhaar card'] },
      { name: 'category', label: 'Social Category', labelHi: 'सामाजिक श्रेणी', type: 'select', options: [{ value: 'General', label: 'General' }, { value: 'OBC', label: 'OBC' }, { value: 'SC', label: 'SC' }, { value: 'ST', label: 'ST' }], aliases: ['caste', 'category', 'varg', 'shreni'] },
      { name: 'village', label: 'Village', labelHi: 'गाँव', type: 'text', aliases: ['village', 'gram', 'gaon'] },
      { name: 'tehsil', label: 'Tehsil / Sub-district', labelHi: 'तहसील', type: 'text', aliases: ['tehsil', 'taluk', 'block'] },
      { name: 'district', label: 'District', labelHi: 'ज़िला', type: 'text', aliases: ['district', 'zila'] },
      { name: 'state', label: 'State', labelHi: 'राज्य', type: 'text', aliases: ['state', 'rajya'] },
      { name: 'pinCode', label: 'PIN Code', labelHi: 'पिन कोड', type: 'text', aliases: ['pincode', 'pin code', 'postal code'] },
      { name: 'address', label: 'Full Address', labelHi: 'पूरा पता', type: 'textarea', aliases: ['address', 'pata', 'residential address'] },
      { name: 'totalLandArea', label: 'Total Land Area (Acres)', labelHi: 'कुल भूमि क्षेत्र (एकड़)', type: 'number', aliases: ['total land', 'land area', 'acres', 'zameen', 'kul kshetrafal'] },
      { name: 'primaryCrop', label: 'Primary Crop', labelHi: 'मुख्य फसल', type: 'text', aliases: ['crop', 'primary crop', 'mukhya fasal', 'kheti'] },
      { name: 'secondaryCrops', label: 'Secondary Crops', labelHi: 'अन्य फसलें', type: 'text', aliases: ['other crops', 'secondary crop', 'anya fasal'] },
      { name: 'irrigationType', label: 'Irrigation Type', labelHi: 'सिंचाई का साधन', type: 'select', options: [{ value: 'Canal', label: 'Canal / River' }, { value: 'Tube Well', label: 'Tube Well / Bore' }, { value: 'Rainfed', label: 'Rainfed' }, { value: 'Drip', label: 'Drip / Micro' }], aliases: ['irrigation', 'sinchai', 'pani ka sadhan'] },
      { name: 'soilType', label: 'Soil Type', labelHi: 'मिट्टी का प्रकार', type: 'select', options: [{ value: 'Alluvial', label: 'Alluvial (जलोढ़)' }, { value: 'Black (Regur)', label: 'Black Cotton (काली)' }, { value: 'Red & Yellow', label: 'Red & Yellow (लाल-पीली)' }, { value: 'Clay Loam', label: 'Clay Loam (दोमट)' }], aliases: ['soil', 'soil type', 'mitti'] },
    ],
  },

  'farmer-profile': {
    formId: 'farmer-profile',
    formTitle: 'Edit Farmer Profile',
    formTitleHi: 'किसान प्रोफ़ाइल संपादन',
    description: 'Update demographic, residential, and agricultural information.',
    fields: [
      { name: 'farmerName', label: 'Farmer Full Name', labelHi: 'किसान का पूरा नाम', type: 'text', required: true, aliases: ['name', 'full name', 'farmer name', 'kisan naam'] },
      { name: 'fatherSpouseName', label: 'Father / Spouse Name', labelHi: 'पिता / पति का नाम', type: 'text', aliases: ['father name', 'spouse name', 'pita ka naam'] },
      { name: 'dob', label: 'Date of Birth', labelHi: 'जन्म तिथि', type: 'date', aliases: ['dob', 'date of birth'] },
      { name: 'gender', label: 'Gender', labelHi: 'लिंग', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }], aliases: ['gender', 'ling'] },
      { name: 'alternateMobile', label: 'Alternate Mobile', labelHi: 'वैकल्पिक मोबाइल', type: 'phone', aliases: ['alternate mobile', 'second phone'] },
      { name: 'aadhaarNumber', label: 'Aadhaar Number', labelHi: 'आधार नंबर', type: 'aadhaar', sensitive: true, aliases: ['aadhaar', 'aadhar card'] },
      { name: 'category', label: 'Category', labelHi: 'श्रेणी', type: 'select', options: [{ value: 'General', label: 'General' }, { value: 'OBC', label: 'OBC' }, { value: 'SC', label: 'SC' }, { value: 'ST', label: 'ST' }], aliases: ['caste', 'category', 'varg'] },
      { name: 'address', label: 'Address', labelHi: 'पता', type: 'textarea', aliases: ['address', 'pata'] },
      { name: 'village', label: 'Village', labelHi: 'गाँव', type: 'text', aliases: ['village', 'gram', 'gaon'] },
      { name: 'tehsil', label: 'Tehsil', labelHi: 'तहसील', type: 'text', aliases: ['tehsil', 'taluka'] },
      { name: 'district', label: 'District', labelHi: 'ज़िला', type: 'text', aliases: ['district', 'zila'] },
      { name: 'state', label: 'State', labelHi: 'राज्य', type: 'text', aliases: ['state', 'rajya'] },
      { name: 'pinCode', label: 'PIN Code', labelHi: 'पिन कोड', type: 'text', aliases: ['pincode', 'pin code'] },
      { name: 'totalLandArea', label: 'Total Land Area (Acres)', labelHi: 'कुल भूमि (एकड़)', type: 'number', aliases: ['land area', 'acres', 'total land'] },
      { name: 'primaryCrop', label: 'Primary Crop', labelHi: 'मुख्य फसल', type: 'text', aliases: ['primary crop', 'mukhya fasal'] },
      { name: 'secondaryCrops', label: 'Secondary Crops', labelHi: 'अन्य फसलें', type: 'text', aliases: ['secondary crops', 'other crops'] },
      { name: 'irrigationType', label: 'Irrigation Type', labelHi: 'सिंचाई साधन', type: 'select', options: [{ value: 'Canal', label: 'Canal' }, { value: 'Tube Well', label: 'Tube Well' }, { value: 'Rainfed', label: 'Rainfed' }, { value: 'Drip', label: 'Drip' }], aliases: ['irrigation'] },
      { name: 'soilType', label: 'Soil Type', labelHi: 'मिट्टी प्रकार', type: 'select', options: [{ value: 'Alluvial', label: 'Alluvial' }, { value: 'Black (Regur)', label: 'Black' }, { value: 'Red & Yellow', label: 'Red & Yellow' }, { value: 'Clay Loam', label: 'Clay Loam' }], aliases: ['soil'] },
    ],
  },

  'land-parcel-registration': {
    formId: 'land-parcel-registration',
    formTitle: 'Register Land Parcel',
    formTitleHi: 'भूमि खसरा पंजीकरण',
    description: 'Register land parcel, khasra number, survey details, and ownership.',
    fields: [
      { name: 'khasraNumber', label: 'Khasra Number', labelHi: 'खसरा नंबर', type: 'text', required: true, aliases: ['khasra', 'khasra no', 'khasra number', 'khasra sankhya'] },
      { name: 'khataNumber', label: 'Khata Number', labelHi: 'खाता नंबर', type: 'text', aliases: ['khata', 'khata no', 'khata number', 'khatoni'] },
      { name: 'surveyNumber', label: 'Survey Number', labelHi: 'सर्वे नंबर', type: 'text', aliases: ['survey number', 'survey no', 'cadastre no'] },
      { name: 'landArea', label: 'Land Area', labelHi: 'भूमि का क्षेत्रफल', type: 'number', required: true, aliases: ['land area', 'area', 'rakba', 'kshetrafal'] },
      { name: 'areaUnit', label: 'Area Unit', labelHi: 'क्षेत्रफल इकाई', type: 'select', options: [{ value: 'ACRE', label: 'Acre' }, { value: 'HECTARE', label: 'Hectare' }, { value: 'BIGHA', label: 'Bigha' }, { value: 'DISMIL', label: 'Dismil' }], aliases: ['unit', 'area unit', 'ikai'] },
      { name: 'village', label: 'Village', labelHi: 'गाँव', type: 'text', aliases: ['village', 'gram', 'gaon'] },
      { name: 'tehsil', label: 'Tehsil', labelHi: 'तहसील', type: 'text', aliases: ['tehsil', 'taluka'] },
      { name: 'district', label: 'District', labelHi: 'ज़िला', type: 'text', aliases: ['district', 'zila'] },
      { name: 'state', label: 'State', labelHi: 'राज्य', type: 'text', aliases: ['state', 'rajya'] },
      { name: 'ownerName', label: 'Owner Name (Bhu-Swami)', labelHi: 'भू-स्वामी का नाम', type: 'text', aliases: ['owner name', 'bhuswami', 'malik naam'] },
      { name: 'cropType', label: 'Crop Grown', labelHi: 'बोई गई फसल', type: 'text', aliases: ['crop', 'fasal', 'crop type'] },
      { name: 'irrigationStatus', label: 'Irrigation Status', labelHi: 'सिंचाई स्थिति', type: 'select', options: [{ value: 'IRRIGATED', label: 'Irrigated (सिंचित)' }, { value: 'UNIRRIGATED', label: 'Unirrigated (असिंचित)' }], aliases: ['irrigation status', 'sinchit'] },
      { name: 'ownershipType', label: 'Ownership Type', labelHi: 'स्वामित्व प्रकार', type: 'select', options: [{ value: 'SINGLE', label: 'Single Owner' }, { value: 'JOINT', label: 'Joint Ownership' }, { value: 'LEASED', label: 'Leased' }], aliases: ['ownership', 'swamitva'] },
    ],
  },

  'loan-registration': {
    formId: 'loan-registration',
    formTitle: 'Register Agricultural Loan',
    formTitleHi: 'कृषि ऋण पंजीकरण',
    description: 'Register KCC crop loan, term loan, or bank sanction.',
    fields: [
      { name: 'bankName', label: 'Bank Name', labelHi: 'बैंक का नाम', type: 'text', required: true, aliases: ['bank', 'bank name', 'bank ka naam'] },
      { name: 'branchName', label: 'Branch Name', labelHi: 'शाखा का नाम', type: 'text', aliases: ['branch', 'shakha', 'branch name'] },
      { name: 'loanType', label: 'Loan Type', labelHi: 'ऋण का प्रकार', type: 'select', options: [{ value: 'KCC_CROP_LOAN', label: 'KCC Crop Loan' }, { value: 'TRACTOR_LOAN', label: 'Tractor / Equipment Loan' }, { value: 'DAIRY_LOAN', label: 'Dairy / Allied' }, { value: 'SOLAR_PUMP_LOAN', label: 'Solar Pump / PM-KUSUM' }, { value: 'GOLD_LOAN_AGRI', label: 'Agri Gold Loan' }], aliases: ['loan type', 'rin prakar'] },
      { name: 'loanAccountReference', label: 'Loan Account / Reference Number', labelHi: 'ऋण खाता संख्या', type: 'text', aliases: ['loan account', 'account number', 'loan number', 'khata sankhya'] },
      { name: 'sanctionedAmount', label: 'Sanctioned Amount (₹)', labelHi: 'स्वीकृत राशि (₹)', type: 'number', required: true, aliases: ['sanctioned amount', 'loan limit', 'swikrit rashi', 'loan amount'] },
      { name: 'disbursedAmount', label: 'Disbursed Amount (₹)', labelHi: 'संवितरित राशि (₹)', type: 'number', aliases: ['disbursed amount', 'jari rashi', 'disbursed'] },
      { name: 'interestRate', label: 'Interest Rate (%)', labelHi: 'ब्याज दर (%)', type: 'number', aliases: ['interest rate', 'byaj dar', 'interest'] },
      { name: 'linkedKhasra', label: 'Linked Khasra Number', labelHi: 'संलग्न खसरा नंबर', type: 'text', aliases: ['linked khasra', 'khasra', 'mortgaged khasra'] },
      { name: 'cropSeason', label: 'Crop Season', labelHi: 'फसल मौसम', type: 'select', options: [{ value: 'Kharif', label: 'Kharif' }, { value: 'Rabi', label: 'Rabi' }, { value: 'Zaid', label: 'Zaid' }], aliases: ['season', 'crop season', 'mausam'] },
      { name: 'cropName', label: 'Crop Name', labelHi: 'फसल का नाम', type: 'text', aliases: ['crop', 'crop name', 'fasal'] },
      { name: 'sanctionDate', label: 'Sanction Date', labelHi: 'स्वीकृति तिथि', type: 'date', aliases: ['sanction date', 'swikriti tithi'] },
      { name: 'maturityDate', label: 'Maturity / Due Date', labelHi: 'परिपक्वता तिथि', type: 'date', aliases: ['due date', 'maturity date', 'last date'] },
    ],
  },

  'grievance-submission': {
    formId: 'grievance-submission',
    formTitle: 'File Administrative Grievance',
    formTitleHi: 'शिकायत दर्ज करें',
    description: 'File an administrative complaint or entitlement dispute.',
    fields: [
      { name: 'category', label: 'Grievance Category', labelHi: 'शिकायत श्रेणी', type: 'select', options: [{ value: 'WRONG_LAND_RECORD', label: 'Land Record Discrepancy' }, { value: 'PM_KISAN_PAYMENT_FAILED', label: 'PM-KISAN Installment Missing' }, { value: 'PMFBY_CLAIM_REJECTED', label: 'Crop Insurance Claim Rejection' }, { value: 'KCC_OVERCHARGED_INTEREST', label: 'KCC Interest Subsidy Overcharge' }, { value: 'MSP_PROCUREMENT_DELAY', label: 'Mandi / MSP Payment Delay' }, { value: 'OTHER', label: 'Other Issue' }], aliases: ['category', 'shreni', 'grievance type', 'mudda'] },
      { name: 'description', label: 'Issue Description', labelHi: 'समस्या का विवरण', type: 'textarea', required: true, aliases: ['description', 'issue', 'vivaran', 'shikayat', 'details'] },
    ],
  },

  'insurance-enrollment': {
    formId: 'insurance-enrollment',
    formTitle: 'Enroll Crop Insurance Policy (PMFBY)',
    formTitleHi: 'फसल बीमा पॉलिसी जोड़ें',
    description: 'Enroll PMFBY policy details, sum insured, and khasra linkage.',
    fields: [
      { name: 'insurancePolicyNumber', label: 'Policy / Application Number', labelHi: 'पॉलिसी / आवेदन संख्या', type: 'text', required: true, aliases: ['policy number', 'policy no', 'bima sankhya', 'application number'] },
      { name: 'insuranceCompany', label: 'Insurance Company', labelHi: 'बीमा कंपनी', type: 'text', aliases: ['insurance company', 'company', 'bima company'] },
      { name: 'crop', label: 'Insured Crop', labelHi: 'बीमित फसल', type: 'text', required: true, aliases: ['crop', 'fasal', 'insured crop'] },
      { name: 'season', label: 'Season & Year', labelHi: 'मौसम एवं वर्ष', type: 'text', aliases: ['season', 'fasal mausam', 'year'] },
      { name: 'khasraNumber', label: 'Khasra Number', labelHi: 'खसरा नंबर', type: 'text', aliases: ['khasra', 'khasra no', 'khasra sankhya'] },
      { name: 'insuredArea', label: 'Insured Area (Acres)', labelHi: 'बीमित क्षेत्रफल (एकड़)', type: 'number', aliases: ['insured area', 'area', 'rakba'] },
      { name: 'sumInsured', label: 'Sum Insured (₹)', labelHi: 'बीमित राशि (₹)', type: 'number', aliases: ['sum insured', 'bima rashi', 'coverage amount'] },
      { name: 'premiumPaid', label: 'Farmer Premium Paid (₹)', labelHi: 'किसान द्वारा दिया प्रीमियम (₹)', type: 'number', aliases: ['premium', 'premium paid', 'kisan premium'] },
    ],
  },

  'insurance-claim': {
    formId: 'insurance-claim',
    formTitle: 'File Crop Insurance Claim',
    formTitleHi: 'फसल बीमा दावा दर्ज करें',
    description: 'Submit crop loss or damage claim under PMFBY.',
    fields: [
      { name: 'insurancePolicyNumber', label: 'Policy Number', labelHi: 'पॉलिसी नंबर', type: 'text', required: true, aliases: ['policy number', 'policy no', 'bima number'] },
      { name: 'claimType', label: 'Claim Peril / Cause', labelHi: 'नुकसान का कारण', type: 'select', options: [{ value: 'INUNDATION', label: 'Inundation / Flooding' }, { value: 'DROUGHT', label: 'Drought / Dry Spell' }, { value: 'HAILSTORM', label: 'Hailstorm' }, { value: 'PEST_ATTACK', label: 'Pest Attack / Disease' }, { value: 'POST_HARVEST', label: 'Post-Harvest Loss' }, { value: 'LOCALIZED_CALAMITY', label: 'Localized Calamity' }], aliases: ['cause', 'peril', 'damage cause', 'nuksan ka karan'] },
      { name: 'damageDate', label: 'Date of Calamity / Damage', labelHi: 'आपदा / नुकसान की तिथि', type: 'date', aliases: ['damage date', 'date', 'tithi', 'loss date'] },
      { name: 'damageType', label: 'Damage Title', labelHi: 'नुकसान का शीर्षक', type: 'text', aliases: ['damage title', 'calamity'] },
      { name: 'damageDescription', label: 'Description of Crop Loss', labelHi: 'नुकसान का पूरा विवरण', type: 'textarea', aliases: ['description', 'crop loss details', 'loss description'] },
      { name: 'estimatedDamagePercentage', label: 'Estimated Damage (%)', labelHi: 'अनुमानित क्षति (%)', type: 'number', aliases: ['damage percentage', 'percent', 'pratishat'] },
      { name: 'claimAmount', label: 'Claim Amount Claimed (₹)', labelHi: 'दावा राशि (₹)', type: 'number', aliases: ['claim amount', 'dawa rashi', 'amount'] },
    ],
  },

  'bank-cadastre-verification': {
    formId: 'bank-cadastre-verification',
    formTitle: 'Bank Cadastre & Land Verification',
    formTitleHi: 'बैंक भू-राजस्व एवं खसरा सत्यापन',
    description: 'Query cadastre records and verify land ownership for bank loan approval.',
    fields: [
      { name: 'surveyNumber', label: 'Khasra / Survey Number', labelHi: 'खसरा / सर्वे नंबर', type: 'text', required: true, aliases: ['survey number', 'khasra', 'khasra no', 'survey no'] },
      { name: 'farmerId', label: 'Applicant Farmer ID / Reference', labelHi: 'आवेदक किसान आईडी', type: 'text', aliases: ['farmer id', 'applicant id', 'kisan id'] },
    ],
  },
};

/**
 * Retrieve form schema by ID, with a fallback generic schema for any custom form.
 */
export function getFormSchema(formId) {
  if (FORM_REGISTRY[formId]) {
    return FORM_REGISTRY[formId];
  }
  return {
    formId: formId || 'custom-form',
    formTitle: 'Custom Form',
    formTitleHi: 'कस्टम फ़ॉर्म',
    description: 'Generic form assistant schema',
    fields: [],
  };
}

/**
 * Dynamically register a new form schema at runtime.
 */
export function registerFormSchema(schema) {
  if (schema && schema.formId) {
    FORM_REGISTRY[schema.formId] = schema;
  }
}
