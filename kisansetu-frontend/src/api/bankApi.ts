import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { FarmerProfile } from '../types/farmer.types';
import { LandRecordResponse } from '../types/land.types';
import { LoanRecordResponse } from '../types/loan.types';
import { VerificationReportResponse, VerificationRequest } from '../types/bank.types';

export const bankApi = {
  /**
   * Submit Bank Officer Verification Decision
   */
  async submitDecision(data: {
    farmerId: string;
    recordType: string;
    targetId: string;
    decision?: string;
    verificationStatus?: string;
    remarks?: string;
    reasonForMismatch?: string;
    additionalDocumentsRequested?: string;
  }): Promise<ApiResponse<any>> {
    const payload = {
      farmerId: data.farmerId,
      recordType: data.recordType,
      targetId: String(data.targetId),
      verificationStatus: data.verificationStatus || data.decision || 'VERIFIED',
      remarks: data.remarks,
      reasonForMismatch: data.reasonForMismatch,
      additionalDocumentsRequested: data.additionalDocumentsRequested,
    };
    const response = await apiClient.post<ApiResponse<any>>('/bank/verifications/decision', payload);
    return response.data;
  },

  /**
   * Get Bank Dashboard Statistics
   */
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/bank/dashboard/stats');
    return response.data;
  },

  /**
   * Get Verification Records for a Farmer
   */
  async getFarmerVerificationRecords(farmerId: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/bank/verifications/records/${farmerId}`);
    return response.data;
  },

  /**
   * Search Farmers by name, mobile, village, or district
   */
  async searchFarmers(query = ''): Promise<ApiResponse<FarmerProfile[]>> {
    const response = await apiClient.get<ApiResponse<FarmerProfile[]>>('/bank/farmers/search', {
      params: { query },
    });
    return response.data;
  },

  /**
   * Search Land Records with Composite Geographical Identity
   */
  async searchLand(params: {
    state?: string;
    district?: string;
    tehsil?: string;
    village?: string;
    khasraNumber?: string;
  }): Promise<ApiResponse<LandRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LandRecordResponse[]>>('/bank/land/search', {
      params,
    });
    return response.data;
  },

  /**
   * Get Farmer Loan History across all institutions
   */
  async getFarmerLoanHistory(farmerId: string): Promise<ApiResponse<LoanRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LoanRecordResponse[]>>(`/bank/loan-history/${farmerId}`);
    return response.data;
  },

  /**
   * Cross-Verify Loan Application for duplicate financing & mortgage alerts
   */
  async verifyApplication(request: VerificationRequest): Promise<ApiResponse<VerificationReportResponse>> {
    const response = await apiClient.post<ApiResponse<VerificationReportResponse>>(
      '/bank/verify-application',
      request
    );
    return response.data;
  },

  /**
   * Get Verification Report by Report ID
   */
  async getVerificationReport(reportId: string): Promise<ApiResponse<VerificationReportResponse>> {
    const response = await apiClient.get<ApiResponse<VerificationReportResponse>>(
      `/bank/verification-reports/${reportId}`
    );
    return response.data;
  },
};

export default bankApi;
