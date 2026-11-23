import discrepancyApi from '../api/discrepancyApi';
import { adaptDiscrepancy } from '../api/adapters';

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
 * Fetch all detected discrepancies for a farmer
 */
export async function getDiscrepancies(farmerId) {
  const uuid = resolveFarmerUuid(farmerId);
  if (!uuid) return { success: true, data: [] };
  try {
    const res = await discrepancyApi.getByFarmer(uuid);
    const rawList = Array.isArray(res.data) ? res.data : [];
    const adaptedList = rawList.map(adaptDiscrepancy);
    return { success: true, data: adaptedList };
  } catch (err) {
    return { success: true, data: [] };
  }
}

/**
 * Trigger an automated scan for a farmer
 */
export async function detectDiscrepancies(farmerId) {
  const uuid = resolveFarmerUuid(farmerId);
  if (!uuid) return { success: true, data: [] };
  try {
    const res = await discrepancyApi.detect(uuid);
    const rawList = Array.isArray(res.data) ? res.data : [];
    const adaptedList = rawList.map(adaptDiscrepancy);
    return { success: true, data: adaptedList };
  } catch {
    return { success: true, data: [] };
  }
}

export default {
  getDiscrepancies,
  detectDiscrepancies,
};
