export interface LoanTransactionResponse {
  id: number;
  loanId: number;
  transactionType: 'DISBURSEMENT' | 'INTEREST_CHARGED' | 'REPAYMENT' | 'SUBVENTION_CREDIT' | 'PROMPT_REPAYMENT_INCENTIVE';
  amount: number;
  transactionDate: string;
  referenceNumber: string;
  description?: string;
}

export interface LoanRecordResponse {
  id: number;
  farmerId: string;
  farmerName?: string;
  bankId: number;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  loanAccountReference: string;
  loanType: string;
  sanctionedAmount: number;
  disbursedAmount: number;
  interestRate: number;
  disbursementDate: string;
  maturityDate: string;
  repaymentStatus: 'ACTIVE' | 'CLOSED' | 'DEFAULTED' | 'NPA';
  collaterals?: Array<{
    landRecordId: number;
    khasraNumber: string;
    collateralStatus: string;
  }>;
  createdAt?: string;

  // Frontend UI backward compatibility fields
  outstandingAmount?: number;
  loanStatus?: string;
  sanctionDate?: string;
  repaymentDueDate?: string;
  bankNameHi?: string;
  loanTypeHi?: string;
  cropSeason?: string;
  cropName?: string;
  linkedKhasra?: string;
  verificationStatus?: string;
  duplicateFlag?: boolean;
}
