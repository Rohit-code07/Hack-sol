import { FarmerProfile } from '../types/farmer.types';
import { LandRecordResponse } from '../types/land.types';
import { LoanRecordResponse } from '../types/loan.types';
import { DiscrepancyResponse } from '../types/discrepancy.types';
import { EntitlementCalculationResponse } from '../types/entitlement.types';
import { GrievanceResponse } from '../types/grievance.types';

/**
 * Adapts Spring Boot FarmerResponse to the UI Farmer shape
 */
export function adaptFarmer(raw: any): FarmerProfile {
  if (!raw) return raw;
  const mobile = raw.mobileNumber || '';
  const idStr = String(raw.id || '');
  const lastFour = idStr.length >= 4 ? idStr.slice(-4) : '9988';

  return {
    ...raw,
    id: raw.id,
    farmerName: raw.farmerName || raw.name || '',
    name: raw.farmerName || raw.name || '',
    village: raw.village || '',
    tehsil: raw.tehsil || '',
    district: raw.district || '',
    state: raw.state || '',
    mobileNumber: mobile,
    mobileMasked: mobile ? `XXXXXX${mobile.slice(-4)}` : '',
    bankAccountMasked: lastFour ? `XXXX XXXX ${lastFour}` : '',
    status: raw.status || 'ACTIVE',
    category: raw.category || 'GENERAL',
  };
}

/**
 * Adapts Spring Boot LandRecordResponse to UI LandRecord shape
 */
export function adaptLandRecord(raw: any, farmerName = ''): LandRecordResponse {
  if (!raw) return raw;

  const regOwner = raw.ownerName || raw.registeredOwnerName || (raw.owners && raw.owners[0]?.farmerName) || farmerName || '';

  return {
    ...raw,
    id: raw.id,
    khasraNumber: raw.khasraNumber || raw.surveyNumber || '',
    surveyNumber: raw.khasraNumber || raw.surveyNumber || '',
    khataNumber: raw.khataNumber || '',
    village: raw.village || '',
    tehsil: raw.tehsil || '',
    district: raw.district || '',
    state: raw.state || '',
    landArea: Number(raw.landArea || raw.areaHectares || 0),
    areaHectares: Number(raw.landArea || raw.areaHectares || 0),
    areaUnit: raw.areaUnit || 'ACRES',
    ownershipStatus: raw.ownershipStatus || 'CLEAR',
    registeredOwnerName: regOwner,
    ownerName: regOwner,
    cropType: raw.cropType || 'Paddy',
    irrigationStatus: raw.irrigationStatus || 'UNIRRIGATED',
    landUsage: raw.landUsage || 'AGRICULTURAL',
    isMortgaged: Boolean(raw.isMortgaged || (raw.activeMortgages && raw.activeMortgages.length > 0)),
    verificationStatus: raw.verificationStatus || 'PENDING',
    verificationRemarks: raw.verificationRemarks || '',
    mortgages: raw.mortgages || raw.activeMortgages || [],
  };
}

/**
 * Adapts Spring Boot LoanRecordResponse to UI Loan shape
 */
export function adaptLoan(raw: any): LoanRecordResponse {
  if (!raw) return raw;

  const isClosed = raw.repaymentStatus === 'CLOSED';
  const disbursed = Number(raw.disbursedAmount || raw.sanctionedAmount || 0);

  return {
    ...raw,
    id: raw.id,
    farmerId: raw.farmerId,
    farmerName: raw.farmerName,
    bankId: raw.bankId,
    bankName: raw.branchName ? `${raw.bankName} (${raw.branchName})` : (raw.bankName || 'State Bank of India'),
    branchName: raw.branchName || '',
    loanAccountReference: raw.loanAccountReference || `KCC-LOAN-${raw.id}`,
    loanType: raw.loanType || 'KCC_CROP_LOAN',
    sanctionedAmount: Number(raw.sanctionedAmount || 0),
    disbursedAmount: disbursed,
    outstandingAmount: Number(raw.outstandingAmount != null ? raw.outstandingAmount : (isClosed ? 0 : disbursed)),
    interestRate: Number(raw.interestRate || 7.0),
    disbursementDate: raw.disbursementDate || '2023-05-10',
    sanctionDate: raw.sanctionDate || raw.disbursementDate || '2023-05-10',
    maturityDate: raw.maturityDate || '2024-05-09',
    repaymentDueDate: raw.repaymentDueDate || raw.maturityDate || '2024-05-09',
    repaymentStatus: raw.repaymentStatus || 'ACTIVE',
    loanStatus: raw.repaymentStatus || 'ACTIVE',
    cropSeason: raw.cropSeason || 'Kharif',
    cropName: raw.cropName || 'Paddy',
    linkedKhasra: raw.linkedKhasra || '',
    verificationStatus: raw.verificationStatus || 'PENDING',
    duplicateFlag: Boolean(raw.duplicateFlag),
  };
}

/**
 * Adapts Spring Boot DiscrepancyResponse to UI Discrepancy shape
 */
export function adaptDiscrepancy(raw: any): DiscrepancyResponse {
  if (!raw) return raw;

  const diff = Number(raw.differenceAmount || 0);
  const exp = Number(raw.expectedAmount || 0);
  const act = Number(raw.actualAmount || 0);
  const isResolved = raw.verificationStatus === 'RESOLVED';

  return {
    ...raw,
    id: raw.id,
    farmerId: raw.farmerId,
    category: raw.category || 'MSP_PAYMENT_DISCREPANCY',
    ruleCode: raw.category || 'MSP_PAYMENT_DISCREPANCY',
    differenceAmount: diff,
    difference: diff,
    expectedAmount: exp,
    amountDue: exp,
    actualAmount: act,
    amountPaid: act,
    severity: raw.severity || 'HIGH',
    description: raw.description || 'Discrepancy detected in statutory payment calculation.',
    recommendedAction: raw.description || 'Submit official grievance petition to district agriculture officer.',
    verificationStatus: raw.verificationStatus || 'DETECTED',
    status: isResolved ? 'RESOLVED' : 'OPEN',
    resolved: isResolved,
    createdAt: raw.createdAt || new Date().toISOString(),
    detectedAt: raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Adapts Spring Boot EntitlementCalculationResponse to UI Entitlement shape
 */
export function adaptEntitlement(raw: any): EntitlementCalculationResponse {
  if (!raw) return raw;

  const exp = Number(raw.expectedAmount || 0);
  const act = Number(raw.actualAmount || 0);
  const diff = Number(raw.differenceAmount || 0);

  return {
    ...raw,
    id: raw.id,
    farmerId: raw.farmerId,
    schemeCode: raw.schemeCode || 'KCC_SUBVENTION',
    entitlementType: raw.entitlementType || 'KCC_INTEREST_SUBVENTION',
    schemeType: raw.applicableScheme || raw.schemeCode || 'Modified Interest Subvention Scheme (MISS)',
    applicableScheme: raw.applicableScheme || 'Government Statutory Scheme',
    eligibilityStatus: raw.eligibilityStatus || 'ELIGIBLE',
    status: raw.eligibilityStatus || 'ELIGIBLE',
    expectedAmount: exp,
    amountDue: exp,
    actualAmount: act,
    amountPaid: act,
    differenceAmount: diff,
    difference: diff,
    explanation: raw.explanation || '',
    calculationBreakdown: raw.calculationBreakdown || {},
    calculatedAt: raw.calculatedAt || new Date().toISOString(),
  };
}

/**
 * Adapts Spring Boot GrievanceResponse to UI Grievance shape
 */
export function adaptGrievance(raw: any): GrievanceResponse {
  if (!raw) return raw;

  return {
    ...raw,
    id: raw.id,
    farmerId: raw.farmerId,
    discrepancyId: raw.discrepancyId,
    subject: raw.subject || `Grievance #${raw.id}`,
    grievanceContent: raw.grievanceContent || '',
    description: raw.grievanceContent || '',
    referenceNumber: `KS-GRV-2024-${String(raw.id).padStart(4, '0')}`,
    category: 'STATUTORY_BENEFIT_DISCREPANCY',
    status: raw.status || 'DRAFTED',
    language: raw.language || 'hi',
    evidenceChecklist: raw.evidenceChecklist || [],
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}
