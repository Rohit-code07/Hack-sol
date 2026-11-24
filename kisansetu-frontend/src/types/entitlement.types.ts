export type CalculationStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'DISCREPANCY_DETECTED' | 'MATCH' | 'INSUFFICIENT_DATA';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';

export interface KccEvaluationRequest {
  farmerId: string;
  loanId?: number;
  loanAmount: number;
  loanType: string;
  disbursementDate: string;
  repaymentDate?: string;
  repaymentStatus?: string;
  applicableSchemeYear?: string;
  actualInterestCharged?: number;
}

export interface MspVerificationRequest {
  farmerId: string;
  crop: string;
  cropGrade?: string;
  marketingSeason: string;
  acceptedQuantity: number;
  quantityUnit?: string;
  procurementCenter?: string;
  applicableMsp?: number;
  actualPayment: number;
  documentedDeductions?: number;
  transactionDate?: string;
  receiptReference?: string;
}

export interface InsuranceReconciliationRequest {
  farmerId: string;
  insurancePolicyNumber: string;
  crop?: string;
  season?: string;
  sanctionedClaimAmount?: number;
  actualPayout: number;
  claimDate?: string;
  paymentDate?: string;
}

export interface EntitlementCalculationResponse {
  id?: number;
  farmerId: string;
  schemeCode: string;
  entitlementType: string;
  eligibilityStatus: CalculationStatus;
  expectedAmount: number;
  actualAmount: number;
  differenceAmount: number;
  applicableScheme: string;
  ruleVersion?: string;
  calculationBreakdown?: Record<string, any>;
  sourceDocumentReference?: string;
  verificationStatus?: VerificationStatus;
  explanation?: string;
  calculatedAt?: string;

  // Frontend UI backward compatibility fields
  schemeType?: string;
  amountDue?: number;
  amountPaid?: number;
  difference?: number;
  status?: string;
}
