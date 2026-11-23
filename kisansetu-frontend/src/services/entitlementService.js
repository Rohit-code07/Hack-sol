import entitlementApi from '../api/entitlementApi';
import { adaptEntitlement } from '../api/adapters';

function getActiveFarmerId() {
  try {
    const raw = localStorage.getItem('ks_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.farmerId) return parsed.farmerId;
      if (parsed.id) return parsed.id;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function resolveFarmerUuid(id) {
  if (!id) return getActiveFarmerId();
  return id;
}

/**
 * Fetch all entitlement records and audit trails for a farmer
 */
export async function getEntitlements(farmerId) {
  const uuid = resolveFarmerUuid(farmerId);
  if (!uuid) return { success: true, data: [] };
  try {
    const res = await entitlementApi.getByFarmer(uuid);
    const rawList = Array.isArray(res.data) ? res.data : [];
    const adaptedList = rawList.map(adaptEntitlement);
    return { success: true, data: adaptedList };
  } catch (err) {
    return { success: false, data: [] };
  }
}

/**
 * Evaluate KCC Interest Subvention under MISS Scheme via Spring Boot Rule Engine
 */
export async function calculateKCC(params = {}) {
  const {
    landArea = 2.5,
    cropType = 'Soybean',
    season = 'Kharif',
    farmerId,
    loanId = 1,
    loanAmount,
    disbursementDate = '2023-05-10',
    repaymentDate = '2024-05-09',
    repaymentStatus = 'CLOSED',
    actualInterestCharged = 10500.0,
  } = params;

  const uuid = resolveFarmerUuid(farmerId);
  const area = parseFloat(landArea) || 2.5;
  const computedLoanAmount = loanAmount ? Number(loanAmount) : Math.round(area * 60000);

  const request = {
    farmerId: uuid,
    loanId: Number(loanId) || 1,
    loanAmount: computedLoanAmount,
    loanType: 'KCC_CROP_LOAN',
    disbursementDate,
    repaymentDate,
    repaymentStatus,
    applicableSchemeYear: season === 'Rabi' ? '2023-24' : '2024-25',
    actualInterestCharged: Number(actualInterestCharged) || 10500.0,
  };

  const res = await entitlementApi.evaluateKcc(request);
  const ent = res.data;

  // Adapt for existing UI components
  const eligibleLimit = Number(ent.calculationBreakdown?.maxEligibleAmount || computedLoanAmount);
  const baseCropCost = Math.round(eligibleLimit * 0.7);
  const householdProvision = Math.round(eligibleLimit * 0.1);
  const maintenanceProvision = Math.round(eligibleLimit * 0.2);

  return {
    success: true,
    data: {
      landArea: area,
      cropType,
      season,
      benchmarkRate: 48000,
      baseCropCost,
      householdProvision,
      maintenanceProvision,
      eligibleLimit,
      applicableScheme: ent.applicableScheme,
      ruleVersion: ent.ruleVersion,
      eligibilityStatus: ent.eligibilityStatus,
      expectedInterest: ent.expectedAmount,
      actualInterest: ent.actualAmount,
      differenceAmount: ent.differenceAmount,
      explanation: ent.explanation,
      calculationBreakdown: ent.calculationBreakdown,
      calculatedAt: ent.calculatedAt || new Date().toISOString(),
    },
  };
}

/**
 * Verify Mandi MSP Payout against CACP Rates via Spring Boot Rule Engine
 */
export async function verifyMSP(params = {}) {
  const {
    cropType = 'Soybean',
    quantity = 20,
    claimedAmount = 82000,
    farmerId = DEFAULT_FARMER_UUID,
  } = params;

  const uuid = resolveFarmerUuid(farmerId);
  const qty = parseFloat(quantity) || 20;
  const claimed = parseFloat(claimedAmount) || 82000;

  // Normalize crop name for backend CACP rule lookup
  let normalizedCrop = 'SOYABEAN';
  const cropLower = String(cropType).toLowerCase();
  if (cropLower.includes('paddy') && cropLower.includes('grade')) normalizedCrop = 'PADDY_GRADE_A';
  else if (cropLower.includes('paddy')) normalizedCrop = 'PADDY_COMMON';
  else if (cropLower.includes('wheat')) normalizedCrop = 'WHEAT';
  else if (cropLower.includes('maize')) normalizedCrop = 'MAIZE';
  else if (cropLower.includes('cotton')) normalizedCrop = 'COTTON';
  else if (cropLower.includes('mustard')) normalizedCrop = 'MUSTARD';
  else if (cropLower.includes('gram')) normalizedCrop = 'GRAM';

  const request = {
    farmerId: uuid,
    crop: normalizedCrop,
    cropGrade: normalizedCrop.includes('GRADE_A') ? 'GRADE_A' : 'FAQ',
    marketingSeason: 'KHARIF_2023',
    acceptedQuantity: qty,
    quantityUnit: 'QUINTAL',
    procurementCenter: 'Arang Mandi Center #4',
    actualPayment: claimed,
    documentedDeductions: 150.0,
    transactionDate: '2023-11-15',
    receiptReference: 'MSP-ARNG-2023-001',
  };

  const res = await entitlementApi.verifyMsp(request);
  const data = res.data;

  const isFair =
    data.eligibilityStatus === 'ELIGIBLE' ||
    data.eligibilityStatus === 'MATCH' ||
    Number(data.differenceAmount || 0) <= 0;

  const officialRate = Number(
    data.calculationBreakdown?.officialMspPerQuintal || (data.expectedAmount ? data.expectedAmount / qty : 2203)
  );

  return {
    success: true,
    data: {
      cropType,
      quantity: qty,
      claimedAmount: claimed,
      officialRate,
      expectedMSP: Number(data.expectedAmount || 0),
      difference: Number(data.differenceAmount || 0),
      isFair,
      status: isFair ? 'VERIFIED' : 'MISMATCH',
      explanation: data.explanation,
      applicableScheme: data.applicableScheme,
      ruleVersion: data.ruleVersion,
      breakdown: data.calculationBreakdown,
    },
  };
}

/**
 * Reconcile PMFBY Crop Insurance Claim via Spring Boot Rule Engine
 */
export async function reconcileInsurance(params = {}) {
  const {
    farmerId,
    policyId = 'PMFBY-CG-2023-0001',
    paidAmount = 30000,
    crop = 'Paddy',
    season = 'KHARIF_2023',
  } = params;

  const uuid = resolveFarmerUuid(farmerId);
  const amt = parseFloat(paidAmount) || 0;

  const request = {
    farmerId: uuid,
    insurancePolicyNumber: policyId.trim(),
    crop,
    season,
    sanctionedClaimAmount: 45000.0,
    actualPayout: amt,
    paymentDate: '2024-01-10',
  };

  const res = await entitlementApi.reconcileInsurance(request);
  const data = res.data;

  const isMismatch = data.eligibilityStatus === 'DISCREPANCY_DETECTED';

  return {
    success: true,
    data: {
      farmerId: uuid,
      policyId: policyId || 'PMFBY-CG-2023-0001',
      paidAmount: amt,
      sanctionedAmount: Number(data.expectedAmount || 45000),
      differenceAmount: Number(data.differenceAmount || 0),
      status: isMismatch ? 'MISMATCH' : 'PAID',
      reconciled: !isMismatch,
      statePortalRef: data.sourceDocumentReference || policyId,
      estimatedClaim: Number(data.expectedAmount || 45000),
      explanation: data.explanation,
      timestamp: data.calculatedAt || new Date().toISOString(),
    },
  };
}

export default {
  getEntitlements,
  calculateKCC,
  verifyMSP,
  reconcileInsurance,
};
