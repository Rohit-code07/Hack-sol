export interface VerificationAlert {
  alertType: string;
  severity: string;
  alertTitle: string;
  description: string;
}

export interface VerificationRequest {
  farmerId: string;
  landRecordIds: number[];
  requestedLoanAmount?: number;
  proposedPledgedArea?: number;
  declaredExistingMortgage?: boolean;
  remarks?: string;
}

export interface VerificationReportResponse {
  reportId: string;
  farmerId: string;
  farmerName?: string;
  mobileNumber?: string;
  totalParcelsChecked: number;
  totalRecordedArea: number;
  activeLoansFound: number;
  existingLoanExposure?: number;
  hasDuplicateFinancing: boolean;
  hasMortgageAlert: boolean;
  hasOwnershipMismatch: boolean;
  hasAreaMismatch: boolean;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  alerts: VerificationAlert[];
  generatedAt: string;
}
