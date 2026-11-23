import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { FarmerProfile, FarmerDashboardSummary } from '../types/farmer.types';
import { LandRecordResponse } from '../types/land.types';
import { LoanRecordResponse } from '../types/loan.types';
import { DiscrepancyResponse } from '../types/discrepancy.types';
import { GrievanceResponse } from '../types/grievance.types';

export const farmerApi = {
  /**
   * Get Farmer Profile by UUID
   */
  async getProfile(farmerId: string): Promise<ApiResponse<FarmerProfile>> {
    const response = await apiClient.get<ApiResponse<FarmerProfile>>(`/farmers/${farmerId}`);
    return response.data;
  },

  /**
   * Update Farmer Profile
   */
  async updateProfile(farmerId: string, data: Partial<FarmerProfile>): Promise<ApiResponse<FarmerProfile>> {
    const response = await apiClient.put<ApiResponse<FarmerProfile>>(`/farmers/${farmerId}`, data);
    return response.data;
  },

  /**
   * Get Comprehensive Farmer Dashboard
   */
  async getDashboard(farmerId: string): Promise<ApiResponse<FarmerDashboardSummary>> {
    const response = await apiClient.get<ApiResponse<FarmerDashboardSummary>>(`/farmers/${farmerId}/dashboard`);
    return response.data;
  },

  /**
   * Get Land Records for Farmer
   */
  async getLandRecords(farmerId: string): Promise<ApiResponse<LandRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LandRecordResponse[]>>(`/farmers/${farmerId}/land-records`);
    return response.data;
  },

  /**
   * Get Loans for Farmer
   */
  async getLoans(farmerId: string): Promise<ApiResponse<LoanRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LoanRecordResponse[]>>(`/farmers/${farmerId}/loans`);
    return response.data;
  },

  /**
   * Get Discrepancies for Farmer
   */
  async getDiscrepancies(farmerId: string): Promise<ApiResponse<DiscrepancyResponse[]>> {
    const response = await apiClient.get<ApiResponse<DiscrepancyResponse[]>>(`/farmers/${farmerId}/discrepancies`);
    return response.data;
  },

  /**
   * Get Grievance History for Farmer
   */
  async getGrievances(farmerId: string): Promise<ApiResponse<GrievanceResponse[]>> {
    const response = await apiClient.get<ApiResponse<GrievanceResponse[]>>(`/farmers/${farmerId}/grievances`);
    return response.data;
  },
};

export default farmerApi;
