import authApi from '../api/authApi';
import farmerApi from '../api/farmerApi';
import { adaptFarmer } from '../api/adapters';

// Authentication Service connecting to Spring Boot backend

/**
 * Perform login against Spring Boot REST API
 */
export async function login(username, password) {
  const res = await authApi.login({ username, password });
  if (res.success && res.data) {
    const authData = res.data;
    localStorage.setItem('ks_token', authData.token);

    let farmerName = null;
    if (authData.farmerId) {
      try {
        const profileRes = await farmerApi.getProfile(authData.farmerId);
        if (profileRes.success && profileRes.data) {
          const profile = adaptFarmer(profileRes.data);
          farmerName = profile.name;
        }
      } catch {
        farmerName = authData.username;
      }
    }

    const session = {
      role: authData.role === 'BANK_OFFICER' ? 'bank' : 'farmer',
      farmerId: authData.farmerId || null,
      farmerName: farmerName || authData.username,
      officerName: authData.role === 'BANK_OFFICER' ? authData.username : null,
      username: authData.username,
      token: authData.token,
      isAuthenticated: true,
    };

    localStorage.setItem('ks_auth', JSON.stringify(session));
    return { success: true, data: session };
  }
  return res;
}

/**
 * Login as Farmer
 */
export async function loginFarmer(username, password) {
  return login(username, password);
}

/**
 * Login as Bank Officer
 */
export async function loginBank(username, password) {
  return login(username, password);
}

/**
 * Register a new farmer
 */
export async function registerFarmer(data) {
  const username = data.username || `farmer_${Date.now()}`;
  const password = data.password || 'password123';

  const regRequest = {
    username,
    password,
    role: 'FARMER',
    farmerName: data.name || data.farmerName,
    fatherSpouseName: data.fatherSpouseName || data.fatherName || null,
    dob: data.dob || null,
    gender: data.gender || 'Male',
    mobileNumber: data.mobile || data.mobileNumber || '9827100099',
    alternateMobile: data.alternateMobile || null,
    aadhaarNumber: data.aadhaarNumber || null,
    category: data.category || 'General',
    address: data.address || null,
    village: data.village || 'Arang',
    tehsil: data.tehsil || 'Arang',
    district: data.district || 'Raipur',
    state: data.state || 'Chhattisgarh',
    pinCode: data.pinCode || null,
    farmerType: data.farmerType || 'Individual',
    farmingType: data.farmingType || 'Owner',
    primaryCrop: data.primaryCrop || 'Paddy',
    secondaryCrops: data.secondaryCrops || null,
    totalLandArea: data.totalLandArea ? Number(data.totalLandArea) : 0,
    irrigationAvailable: Boolean(data.irrigationAvailable),
    irrigationType: data.irrigationType || 'Rainfed',
    soilType: data.soilType || 'Alluvial',
    documentsJson: data.documentsJson ? (typeof data.documentsJson === 'string' ? data.documentsJson : JSON.stringify(data.documentsJson)) : null,
    preferredLanguage: data.preferredLanguage || 'hi',
  };

  const res = await authApi.register(regRequest);
  if (res.success && res.data) {
    const authData = res.data;
    localStorage.setItem('ks_token', authData.token);

    const session = {
      role: 'farmer',
      farmerId: authData.farmerId,
      farmerName: regRequest.farmerName,
      officerName: null,
      username: authData.username,
      token: authData.token,
      isAuthenticated: true,
      id: authData.farmerId,
      name: regRequest.farmerName,
      village: regRequest.village,
      district: regRequest.district,
      mobileMasked: `XXXXXX${regRequest.mobileNumber.slice(-4)}`,
    };

    localStorage.setItem('ks_auth', JSON.stringify(session));
    return { success: true, data: session };
  }
  return res;
}

/**
 * Clear local session
 */
export function logout() {
  localStorage.removeItem('ks_token');
  localStorage.removeItem('ks_auth');
}

export default {
  login,
  loginFarmer,
  loginBank,
  registerFarmer,
  logout,
};
