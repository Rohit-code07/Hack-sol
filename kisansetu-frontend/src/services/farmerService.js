import farmerApi from '../api/farmerApi';
import bankApi from '../api/bankApi';
import { adaptFarmer, adaptLandRecord, adaptLoan } from '../api/adapters';

function getActiveFarmerId() {
  try {
    const raw = localStorage.getItem('ks_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.farmerId) return parsed.farmerId;
      if (parsed.id) return parsed.id;
    }
  } catch (e) {}
  return null;
}

function resolveFarmerUuid(id) {
  if (!id) return getActiveFarmerId();
  return id;
}

/**
 * Fetch authenticated farmer profile
 */
export async function getMe(farmerId) {
  const uuid = resolveFarmerUuid(farmerId);
  if (!uuid) return { success: false, data: null };
  try {
    const res = await farmerApi.getProfile(uuid);
    const adapted = adaptFarmer(res.data);
    return { success: true, data: adapted };
  } catch (e) {
    return { success: false, data: null };
  }
}

/**
 * Search farmers across registry
 */
export async function getFarmers({ search = '', district = '', page = 1, limit = 10 } = {}) {
  try {
    const res = await bankApi.searchFarmers(search);
    let list = Array.isArray(res.data) ? res.data : [];

    if (district.trim()) {
      list = list.filter((f) => (f.district || '').toLowerCase() === district.toLowerCase().trim());
    }

    const adaptedList = list.map(adaptFarmer);
    const total = adaptedList.length;
    const startIndex = (page - 1) * limit;
    const paginated = adaptedList.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        items: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch {
    return {
      success: true,
      data: { items: [], total: 0, page: 1, limit, totalPages: 1 },
    };
  }
}

/**
 * Get Farmer Profile by UUID
 */
export async function getFarmer(id) {
  const uuid = resolveFarmerUuid(id);
  if (!uuid) return { success: false, data: null };
  try {
    const res = await farmerApi.getProfile(uuid);
    const adapted = adaptFarmer(res.data);
    return { success: true, data: adapted };
  } catch {
    return { success: false, data: null };
  }
}

/**
 * Fetch registered Land Records for a farmer
 */
export async function getFarmerLandRecords(id) {
  const uuid = resolveFarmerUuid(id);
  if (!uuid) return { success: true, data: [] };
  try {
    const res = await farmerApi.getLandRecords(uuid);
    const rawList = Array.isArray(res.data) ? res.data : [];
    const adaptedList = rawList.map((r) => adaptLandRecord(r));
    return { success: true, data: adaptedList };
  } catch {
    return { success: true, data: [] };
  }
}

/**
 * Fetch agricultural loans for a farmer
 */
export async function getFarmerLoans(id) {
  const uuid = resolveFarmerUuid(id);
  if (!uuid) return { success: true, data: [] };
  try {
    const res = await farmerApi.getLoans(uuid);
    const rawList = Array.isArray(res.data) ? res.data : [];
    const adaptedList = rawList.map((l) => adaptLoan(l));
    return { success: true, data: adaptedList };
  } catch {
    return { success: true, data: [] };
  }
}

/**
 * Fetch comprehensive dashboard metrics from backend
 */
export async function getFarmerDashboard(id) {
  const uuid = resolveFarmerUuid(id);
  if (!uuid) return { success: false, data: null };
  try {
    const res = await farmerApi.getDashboard(uuid);
    return res;
  } catch {
    return { success: false, data: null };
  }
}

export default {
  getMe,
  getFarmers,
  getFarmer,
  getFarmerLandRecords,
  getFarmerLoans,
  getFarmerDashboard,
};
