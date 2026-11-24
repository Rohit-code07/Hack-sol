export type DiscrepancySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DiscrepancyResponse {
  id: number;
  farmerId: string;
  category: string;
  referenceId?: string;
  expectedAmount?: number;
  actualAmount?: number;
  differenceAmount?: number;
  severity: DiscrepancySeverity;
  description: string;
  verificationStatus: string;
  createdAt: string;
  resolvedAt?: string;

  // Frontend UI backward compatibility fields
  ruleCode?: string;
  recommendedAction?: string;
  status?: string;
  resolved?: boolean;
  detectedAt?: string;
  amountDue?: number;
  amountPaid?: number;
  difference?: number;
}
