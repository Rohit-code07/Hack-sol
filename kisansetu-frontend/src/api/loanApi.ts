import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';
import { LoanRecordResponse, LoanTransactionResponse } from '../types/loan.types';

export const loanApi = {
  /**
   * Create Agricultural Loan Record
   */
  async create(data: any): Promise<ApiResponse<LoanRecordResponse>> {
    const response = await apiClient.post<ApiResponse<LoanRecordResponse>>('/loans', data);
    return response.data;
  },

  /**
   * Get Loan by ID
   */
  async getById(loanId: number): Promise<ApiResponse<LoanRecordResponse>> {
    const response = await apiClient.get<ApiResponse<LoanRecordResponse>>(`/loans/${loanId}`);
    return response.data;
  },

  /**
   * Get Loans for a Farmer
   */
  async getByFarmer(farmerId: string): Promise<ApiResponse<LoanRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LoanRecordResponse[]>>(`/loans/farmer/${farmerId}`);
    return response.data;
  },

  /**
   * Get Loans issued by a Bank Branch
   */
  async getByBank(bankId: number): Promise<ApiResponse<LoanRecordResponse[]>> {
    const response = await apiClient.get<ApiResponse<LoanRecordResponse[]>>(`/loans/bank/${bankId}`);
    return response.data;
  },

  /**
   * Get Loan Transactions
   */
  async getTransactions(loanId: number): Promise<ApiResponse<LoanTransactionResponse[]>> {
    const response = await apiClient.get<ApiResponse<LoanTransactionResponse[]>>(`/loans/${loanId}/transactions`);
    return response.data;
  },

  /**
   * Record a new Loan Transaction
   */
  async addTransaction(loanId: number, data: Partial<LoanTransactionResponse>): Promise<ApiResponse<LoanTransactionResponse>> {
    const response = await apiClient.post<ApiResponse<LoanTransactionResponse>>(`/loans/${loanId}/transactions`, data);
    return response.data;
  },
};

export default loanApi;
