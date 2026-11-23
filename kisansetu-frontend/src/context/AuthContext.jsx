import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginFarmer, loginBank, logout as clearAuthService } from '../services/authService';

export const AuthContext = createContext({
  role: null,
  farmerId: null,
  farmerName: null,
  officerName: null,
  username: null,
  token: null,
  isAuthenticated: false,
  loginAsFarmer: async () => {},
  loginAsBank: async () => {},
  logout: () => {},
});

export default function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    try {
      const saved = localStorage.getItem('ks_auth');
      const token = localStorage.getItem('ks_token');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (token && !parsed.token) {
          parsed.token = token;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return {
      role: null,
      farmerId: null,
      farmerName: null,
      officerName: null,
      username: null,
      token: null,
    };
  });

  const handleLogout = useCallback(() => {
    clearAuthService();
    setAuthState({
      role: null,
      farmerId: null,
      farmerName: null,
      officerName: null,
      username: null,
      token: null,
    });
  }, []);

  // Listen to 401 unauthorized events from Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener('ks:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('ks:unauthorized', handleUnauthorized);
    };
  }, [handleLogout]);

  useEffect(() => {
    if (authState.role && authState.token) {
      localStorage.setItem('ks_auth', JSON.stringify(authState));
      localStorage.setItem('ks_token', authState.token);
    } else if (!authState.role) {
      localStorage.removeItem('ks_auth');
      localStorage.removeItem('ks_token');
    }
  }, [authState]);

  const handleLoginAsFarmer = async (username, password) => {
    const res = await loginFarmer(username, password);
    if (res.success && res.data) {
      setAuthState(res.data);
    }
    return res;
  };

  const handleLoginAsBank = async (username, password) => {
    const res = await loginBank(username, password);
    if (res.success && res.data) {
      setAuthState(res.data);
    }
    return res;
  };

  const value = {
    ...authState,
    isAuthenticated: Boolean(authState.role && authState.token),
    loginAsFarmer: handleLoginAsFarmer,
    loginAsBank: handleLoginAsBank,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
