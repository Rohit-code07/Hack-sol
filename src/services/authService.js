// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.
import { USE_MOCK } from '../config/api';
import apiClient, { mockResponse } from './apiClient';
import { farmers } from '../constants/mockData';

export async function loginFarmer(farmerId) {
  if (USE_MOCK) {
    const found = farmers.find((f) => f.id === farmerId) || farmers[2]; // Default FRM-0003 Ramesh Kumar
    const session = {
      role: 'farmer',
      farmerId: found.id,
      farmerName: found.name,
      officerName: null,
    };
    return mockResponse(session);
  }
  return apiClient.post('/auth/login', { role: 'farmer', farmerId });
}

export async function loginBank(officerName) {
  if (USE_MOCK) {
    const session = {
      role: 'bank',
      farmerId: null,
      farmerName: null,
      officerName: officerName || 'Sunita Verma',
    };
    return mockResponse(session);
  }
  return apiClient.post('/auth/login', { role: 'bank', officerName });
}

export async function registerFarmer(data) {
  if (USE_MOCK) {
    const newFarmer = {
      id: `FRM-00${farmers.length + 1}`,
      name: data.name,
      fatherName: data.fatherName || '',
      village: data.village || '',
      district: data.district || 'Wardha',
      state: data.state || 'Maharashtra',
      mobileMasked: `XXXXXX${String(data.mobile || '1234').slice(-4)}`,
      bankAccountMasked: 'XXXX XXXX 9988',
      category: data.category || 'OBC',
      status: 'ACTIVE'
    };
    return mockResponse(newFarmer);
  }
  return apiClient.post('/auth/register', data);
}
