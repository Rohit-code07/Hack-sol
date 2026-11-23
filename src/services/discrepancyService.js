// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.
import { USE_MOCK } from '../config/api';
import apiClient, { mockResponse } from './apiClient';
import { discrepancies } from '../constants/mockData';

export async function getDiscrepancies(farmerId) {
  if (USE_MOCK) {
    const list = discrepancies.filter((d) => d.farmerId === farmerId);
    return mockResponse(list);
  }
  return apiClient.get(`/discrepancies/${farmerId}`);
}
