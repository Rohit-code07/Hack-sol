import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { LandRecordResponse, MortgageItem } from '../types/land.types';

export const landApi = {
  /**
   * Register Land Record Parcel
   */
  async create(data: any): Promise<ApiResponse<LandRecordResponse>> {
    const response = await apiClient.post<ApiResponse<LandRecordResponse>>('/land-records', data);
    return response.data;
  },

  /**
   * Update Land Record Parcel
   */
  async update(id: number, data: any): Promise<ApiResponse<LandRecordResponse>> {
    const response = await apiClient.put<ApiResponse<LandRecordResponse>>(`/land-records/${id}`, data);
    return response.data;
  },

  /**
   * Get Land Record by ID
   */
  async getById(id: number): Promise<ApiResponse<LandRecordResponse>> {
    const response = await apiClient.get<ApiResponse<LandRecordResponse>>(`/land-records/${id}`);
    return response.data;
  },

  /**
   * Search Land Parcels by Composite Geographical Criteria
   */
  async search(params: {
    state?: string;
    district?: string;
    tehsil?: string;
    village?: string;
    khasraNumber?: string;
  }): Promise<ApiResponse<LandRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LandRecordResponse[]>>('/land-records/search', { params });
    return response.data;
  },

  /**
   * Get Land Records for a Farmer
   */
  async getByFarmer(farmerId: string): Promise<ApiResponse<LandRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LandRecordResponse[]>>(`/land-records/farmer/${farmerId}`);
    return response.data;
  },

  /**
   * Get Mortgage Encumbrances for a Parcel
   */
  async getMortgages(landRecordId: number): Promise<ApiResponse<MortgageItem[]>> {
    const response = await apiClient.get<ApiResponse<MortgageItem[]>>(`/land-records/${landRecordId}/mortgage`);
    return response.data;
  },
};

export default landApi;
