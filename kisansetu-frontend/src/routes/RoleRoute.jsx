import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Route Guard for Specific Persona Roles (farmer vs bank)
 */
export default function RoleRoute({ allowedRole, children }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === 'bank' ? '/bank' : '/farmer'} replace />;
  }

  return children;
}
