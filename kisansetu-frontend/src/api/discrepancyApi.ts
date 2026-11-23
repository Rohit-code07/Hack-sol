import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { DiscrepancyResponse } from '../types/discrepancy.types';

export const discrepancyApi = {
  /**
   * Run automated discrepancy scan for a farmer
   */
  async detect(farmerId: string): Promise<ApiResponse<DiscrepancyResponse[]>> {
    const response = await apiClient.post<ApiResponse<DiscrepancyResponse[]>>('/discrepancies/detect', {
      farmerId,
    });
    return response.data;
  },

  /**
   * Get Discrepancy by ID
   */
  async getById(id: number): Promise<ApiResponse<DiscrepancyResponse>> {
    const response = await apiClient.get<ApiResponse<DiscrepancyResponse>>(`/discrepancies/${id}`);
    return response.data;
  },

  /**
   * Get All Discrepancies for a Farmer
   */
  async getByFarmer(farmerId: string): Promise<ApiResponse<DiscrepancyResponse[]>> {
    const response = await apiClient.get<ApiResponse<DiscrepancyResponse[]>>(`/discrepancies/farmer/${farmerId}`);
    return response.data;
  },

  /**
   * Get All Discrepancies System-Wide (Bank Officer access)
   */
  async getAll(): Promise<ApiResponse<DiscrepancyResponse[]>> {
    const response = await apiClient.get<ApiResponse<DiscrepancyResponse[]>>('/discrepancies');
    return response.data;
  },
};

export default discrepancyApi;
