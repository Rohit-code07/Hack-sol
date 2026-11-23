// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.
import { USE_MOCK } from '../config/api';
import apiClient, { mockResponse } from './apiClient';
import { grievances as initialGrievances } from '../constants/mockData';

// Maintain in-memory list for demo session additions
let dynamicGrievances = [...initialGrievances];

export async function getGrievances(farmerId) {
  if (USE_MOCK) {
    const list = dynamicGrievances.filter((g) => g.farmerId === farmerId);
    return mockResponse(list);
  }
  return apiClient.get(`/grievances/${farmerId}`);
}

export async function submitGrievance({ farmerId, category, description }) {
  if (USE_MOCK) {
    const nextSeq = String(dynamicGrievances.length + 1).padStart(6, '0');
    const newGrievance = {
      id: `GRV-${Date.now()}`,
      referenceNumber: `KS-GRV-2026-${nextSeq}`,
      farmerId,
      category,
      description,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    dynamicGrievances.unshift(newGrievance);
    return mockResponse(newGrievance);
  }
  return apiClient.post('/grievances', { farmerId, category, description });
}
