// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.
import { USE_MOCK } from '../config/api';
import apiClient, { mockResponse, mockError } from './apiClient';
import { farmers, landRecords, loans } from '../constants/mockData';

export async function getMe(farmerId = 'FRM-0003') {
  if (USE_MOCK) {
    const found = farmers.find((f) => f.id === farmerId) || farmers[2];
    return mockResponse(found);
  }
  return apiClient.get('/farmers/me');
}

export async function getFarmers({ search = '', district = '', page = 1, limit = 10 } = {}) {
  if (USE_MOCK) {
    let list = [...farmers];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          f.village.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q)
      );
    }
    if (district.trim()) {
      list = list.filter((f) => f.district.toLowerCase() === district.toLowerCase().trim());
    }
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);
    return mockResponse({
      items: paginated,
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit) || 1
    });
  }
  const params = new URLSearchParams({ search, district, page: String(page), limit: String(limit) });
  return apiClient.get(`/farmers?${params.toString()}`);
}

export async function getFarmer(id) {
  if (USE_MOCK) {
    const found = farmers.find((f) => f.id === id);
    if (!found) {
      return mockError('FARMER_NOT_FOUND', `Farmer with ID ${id} not found in registry`, 404);
    }
    return mockResponse(found);
  }
  return apiClient.get(`/farmers/${id}`);
}

export async function getFarmerLandRecords(id) {
  if (USE_MOCK) {
    const list = landRecords.filter((lr) => lr.farmerId === id);
    return mockResponse(list);
  }
  return apiClient.get(`/farmers/${id}/land-records`);
}

export async function getFarmerLoans(id) {
  if (USE_MOCK) {
    const list = loans.filter((l) => l.farmerId === id);
    return mockResponse(list);
  }
  return apiClient.get(`/farmers/${id}/loans`);
}
