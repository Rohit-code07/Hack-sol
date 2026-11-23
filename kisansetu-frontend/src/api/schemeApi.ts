import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';

export interface MspTransactionRequest {
  farmerId: string;
  crop: string;
  cropVariety?: string;
  cropGrade?: string;
  marketingSeason: string;
  procurementYear?: string;
  expectedProduction?: number;
  totalProduction?: number;
  quantitySold?: number;
  quantitySubmitted?: number;
  quantityRejected?: number;
  acceptedQuantity: number;
  quantityUnit?: string;
  procurementCenter: string;
  procurementCenterLocation?: string;
  tokenNumber?: string;
  applicableMsp?: number;
  actualRateReceived?: number;
  documentedDeductions?: number;
  actualPayment: number;
  paymentStatus?: string;
  bankAccountMasked?: string;
  transactionId?: string;
  transactionDate?: string;
  paymentDate?: string;
}

export interface MspTransactionResponse {
  id: number;
  farmerId: string;
  farmerName: string;
  crop: string;
  cropVariety: string;
  cropGrade: string;
  marketingSeason: string;
  procurementYear: string;
  expectedProduction: number;
  totalProduction: number;
  quantitySold: number;
  quantitySubmitted: number;
  quantityRejected: number;
  acceptedQuantity: number;
  quantityUnit: string;
  procurementCenter: string;
  procurementCenterLocation: string;
  tokenNumber: string;
  applicableMsp: number;
  actualRateReceived: number;
  grossProcurementAmount: number;
  documentedDeductions: number;
  expectedPayment: number;
  actualPayment: number;
  pendingPayment: number;
  paymentStatus: string;
  bankAccountMasked: string;
  transactionId: string;
  receiptReference: string;
  transactionDate: string;
  paymentDate: string;
  createdAt: string;
}

export interface InsurancePolicyRequest {
  farmerId: string;
  schemeName?: string;
  crop: string;
  season: string;
  cropYear?: string;
  village?: string;
  block?: string;
  district?: string;
  khasraNumber: string;
  insuranceCompany?: string;
  insurancePolicyNumber: string;
  applicationNumber?: string;
  insuredArea: number;
  sumInsured: number;
  premiumPaid: number;
  premiumPaymentDate?: string;
  enrollmentDate?: string;
}

export interface InsuranceClaimRequest {
  insurancePolicyNumber: string;
  claimType: string;
  damageDate: string;
  damageType: string;
  damageDescription?: string;
  estimatedDamagePercentage: number;
  estimatedLoss: number;
  claimAmount: number;
}

export interface InsuranceRecordResponse {
  id: number;
  farmerId: string;
  farmerName: string;
  schemeName: string;
  crop: string;
  season: string;
  cropYear: string;
  village: string;
  block: string;
  district: string;
  khasraNumber: string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  applicationNumber: string;
  insuredArea: number;
  sumInsured: number;
  premiumPaid: number;
  claimNumber: string;
  claimType: string;
  damageDate: string;
  damageType: string;
  damageDescription: string;
  estimatedDamagePercentage: number;
  estimatedLoss: number;
  claimAmount: number;
  actualPayout: number;
  claimStatus: string;
  claimDate: string;
  payoutDate: string;
  rejectionReason: string;
  createdAt: string;
}

export const schemeApi = {
  async recordMsp(data: MspTransactionRequest): Promise<ApiResponse<MspTransactionResponse>> {
    const response = await apiClient.post<ApiResponse<MspTransactionResponse>>('/schemes/msp', data);
    return response.data;
  },

  async getMspByFarmer(farmerId: string): Promise<ApiResponse<MspTransactionResponse[]>> {
    const response = await apiClient.get<ApiResponse<MspTransactionResponse[]>>(`/schemes/msp/farmer/${farmerId}`);
    return response.data;
  },

  async registerPolicy(data: InsurancePolicyRequest): Promise<ApiResponse<InsuranceRecordResponse>> {
    const response = await apiClient.post<ApiResponse<InsuranceRecordResponse>>('/schemes/insurance/policy', data);
    return response.data;
  },

  async submitClaim(data: InsuranceClaimRequest): Promise<ApiResponse<InsuranceRecordResponse>> {
    const response = await apiClient.post<ApiResponse<InsuranceRecordResponse>>('/schemes/insurance/claim', data);
    return response.data;
  },

  async getInsuranceByFarmer(farmerId: string): Promise<ApiResponse<InsuranceRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<InsuranceRecordResponse[]>>(`/schemes/insurance/farmer/${farmerId}`);
    return response.data;
  },
};

export default schemeApi;
