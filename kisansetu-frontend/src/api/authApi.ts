import apiClient from './axiosClient';
import { ApiResponse, AuthRequest, AuthResponse, RegisterRequest } from '../types/auth.types';

export const authApi = {
  /**
   * Login with username and password
   */
  async login(credentials: AuthRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new farmer or officer user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },
};

export default authApi;
