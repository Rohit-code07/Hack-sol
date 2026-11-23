import React, { createContext, useState, useEffect } from 'react';
import { loginFarmer, loginBank } from '../services/authService';
import { DEMO_HERO_FARMER_ID, DEFAULT_OFFICER_NAME } from '../constants';

export const AuthContext = createContext({
  role: null,
  farmerId: null,
  farmerName: null,
  officerName: null,
  isAuthenticated: false,
  loginAsFarmer: async () => {},
  loginAsBank: async () => {},
  logout: () => {},
});

export default function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    try {
      const saved = localStorage.getItem('ks_auth');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      role: null,
      farmerId: null,
      farmerName: null,
      officerName: null,
    };
  });

  useEffect(() => {
    if (authState.role) {
      localStorage.setItem('ks_auth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('ks_auth');
    }
  }, [authState]);

  const handleLoginAsFarmer = async (farmerId = DEMO_HERO_FARMER_ID) => {
    const res = await loginFarmer(farmerId);
    if (res.success) {
      setAuthState(res.data);
    }
    return res;
  };

  const handleLoginAsBank = async (officerName = DEFAULT_OFFICER_NAME) => {
    const res = await loginBank(officerName);
    if (res.success) {
      setAuthState(res.data);
    }
    return res;
  };

  const handleLogout = () => {
    setAuthState({
      role: null,
      farmerId: null,
      farmerName: null,
      officerName: null,
    });
  };

  const value = {
    ...authState,
    isAuthenticated: Boolean(authState.role),
    loginAsFarmer: handleLoginAsFarmer,
    loginAsBank: handleLoginAsBank,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
