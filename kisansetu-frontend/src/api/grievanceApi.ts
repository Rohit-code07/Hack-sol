import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { GrievanceGenerateRequest, GrievanceResponse } from '../types/grievance.types';

export const grievanceApi = {
  /**
   * Submit Farmer Grievance Directly
   */
  async submit(data: any): Promise<ApiResponse<GrievanceResponse>> {
    const response = await apiClient.post<ApiResponse<GrievanceResponse>>('/grievances', data);
    return response.data;
  },

  /**
   * Update Grievance Status & Officer Remarks
   */
  async updateStatus(id: number, data: any): Promise<ApiResponse<GrievanceResponse>> {
    const response = await apiClient.put<ApiResponse<GrievanceResponse>>(`/grievances/${id}/status`, data);
    return response.data;
  },

  /**
   * Generate structured bilingual grievance petition from discrepancy
   */
  async generate(request: GrievanceGenerateRequest): Promise<ApiResponse<GrievanceResponse>> {
    const response = await apiClient.post<ApiResponse<GrievanceResponse>>('/grievances/generate', request);
    return response.data;
  },

  /**
   * Get Grievance by ID
   */
  async getById(id: number): Promise<ApiResponse<GrievanceResponse>> {
    const response = await apiClient.get<ApiResponse<GrievanceResponse>>(`/grievances/${id}`);
    return response.data;
  },

  /**
   * Get All Grievances for a Farmer
   */
  async getByFarmer(farmerId: string): Promise<ApiResponse<GrievanceResponse[]>> {
    const response = await apiClient.get<ApiResponse<GrievanceResponse[]>>(`/grievances/farmer/${farmerId}`);
    return response.data;
  },

  /**
   * Download Grievance Petition PDF as a Blob stream
   */
  async downloadPdf(id: number, filename?: string): Promise<void> {
    const response = await apiClient.get<Blob>(`/grievances/${id}/pdf`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `grievance-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the object URL after triggering download
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);
  },
};

export default grievanceApi;
