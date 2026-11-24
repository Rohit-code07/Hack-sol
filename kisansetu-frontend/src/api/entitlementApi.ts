import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import {
  EntitlementCalculationResponse,
  InsuranceReconciliationRequest,
  KccEvaluationRequest,
  MspVerificationRequest,
} from '../types/entitlement.types';

export const entitlementApi = {
  /**
   * Evaluate KCC Interest Subvention & Incentive
   */
  async evaluateKcc(request: KccEvaluationRequest): Promise<ApiResponse<EntitlementCalculationResponse>> {
    const response = await apiClient.post<ApiResponse<EntitlementCalculationResponse>>(
      '/entitlements/kcc/evaluate',
      request
    );
    return response.data;
  },

  /**
   * Verify Mandi MSP Payout against CACP Benchmark
   */
  async verifyMsp(request: MspVerificationRequest): Promise<ApiResponse<EntitlementCalculationResponse>> {
    const response = await apiClient.post<ApiResponse<EntitlementCalculationResponse>>(
      '/entitlements/msp/verify',
      request
    );
    return response.data;
  },

  /**
   * Reconcile PMFBY Crop Insurance Claim
   */
  async reconcileInsurance(request: InsuranceReconciliationRequest): Promise<ApiResponse<EntitlementCalculationResponse>> {
    const response = await apiClient.post<ApiResponse<EntitlementCalculationResponse>>(
      '/entitlements/insurance/reconcile',
      request
    );
    return response.data;
  },

  /**
   * Get Past Entitlement History for Farmer
   */
  async getByFarmer(farmerId: string): Promise<ApiResponse<EntitlementCalculationResponse[]>> {
    const response = await apiClient.get<ApiResponse<EntitlementCalculationResponse[]>>(
      `/entitlements/farmer/${farmerId}`
    );
    return response.data;
  },

  /**
   * Get Entitlement Result by ID
   */
  async getById(resultId: number): Promise<ApiResponse<EntitlementCalculationResponse>> {
    const response = await apiClient.get<ApiResponse<EntitlementCalculationResponse>>(
      `/entitlements/${resultId}`
    );
    return response.data;
  },
};

export default entitlementApi;
