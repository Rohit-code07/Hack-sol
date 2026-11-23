import apiClient from './axiosClient';
import { ApiResponse } from '../types/auth.types';

export interface SourceCitation {
  document: string;
  page: number;
  scheme?: string;
  authority?: string;
  url?: string;
  excerpt?: string;
}

export interface AIChatRequest {
  question: string;
  language?: string;
  scheme?: string;
  conversationId?: string;
}

export interface AIChatResponse {
  answer: string;
  responseText?: string;
  sources: SourceCitation[];
  language: string;
  confidence: string;
  requiresVerification?: boolean;
  success?: boolean;
}

export interface AIGrievanceGenerateRequest {
  farmerName: string;
  category: string;
  crop?: string;
  expectedAmount?: number;
  actualAmount?: number;
  differenceAmount?: number;
  language?: string;
  ruleReference?: string;
  description?: string;
}

export interface AIGrievanceGenerateResponse {
  subject: string;
  body: string;
  responseText?: string;
  evidenceChecklist: string[];
  language: string;
  generatedBy?: string;
  success?: boolean;
}

export interface AIDiscrepancyExplainRequest {
  category: string;
  expectedAmount?: number;
  actualAmount?: number;
  differenceAmount?: number;
  status?: string;
  reason?: string;
  language?: string;
}

export interface AIDiscrepancyExplainResponse {
  explanation: string;
  responseText?: string;
  recommendedAction: string;
  documentsToVerify: string[];
  language: string;
  category: string;
  generatedBy?: string;
  success?: boolean;
}

export const aiApi = {
  /**
   * Health check for AI Service and Vector DB via Spring Boot Gateway
   */
  async getHealth(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/ai/health');
    return response.data;
  },

  /**
   * RAG Policy Assistant Chat via Spring Boot Gateway
   */
  async chat(request: AIChatRequest): Promise<ApiResponse<AIChatResponse>> {
    const response = await apiClient.post<ApiResponse<AIChatResponse>>('/ai/chat', request);
    return response.data;
  },

  /**
   * Semantic search across policy documents
   */
  async searchPolicies(query: string, scheme?: string, topK = 5): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/ai/policies/search', {
      query,
      scheme,
      topK,
    });
    return response.data;
  },

  /**
   * Draft structured grievance petition with AI assistance
   */
  async generateGrievance(request: AIGrievanceGenerateRequest): Promise<ApiResponse<AIGrievanceGenerateResponse>> {
    const response = await apiClient.post<ApiResponse<AIGrievanceGenerateResponse>>('/ai/grievance/generate', request);
    return response.data;
  },

  /**
   * Explain verified calculation discrepancy with actionable next steps
   */
  async explainDiscrepancy(request: AIDiscrepancyExplainRequest): Promise<ApiResponse<AIDiscrepancyExplainResponse>> {
    const response = await apiClient.post<ApiResponse<AIDiscrepancyExplainResponse>>('/ai/discrepancy/explain', request);
    return response.data;
  },
};

export default aiApi;
