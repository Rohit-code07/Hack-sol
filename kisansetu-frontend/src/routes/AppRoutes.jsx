import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import FarmerLayout from '../components/layout/FarmerLayout';
import BankLayout from '../components/layout/BankLayout';
import Spinner from '../components/common/Spinner';

// Lazy-loaded route pages for optimal bundle splitting and performance
const LandingPage = lazy(() => import('../pages/landing/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

const FarmerDashboard = lazy(() => import('../pages/farmer/FarmerDashboard'));
const LandRecordsPage = lazy(() => import('../pages/farmer/LandRecordsPage'));
const LoanLedgerPage = lazy(() => import('../pages/farmer/LoanLedgerPage'));
const DiscrepanciesPage = lazy(() => import('../pages/farmer/DiscrepanciesPage'));
const GrievanceHistoryPage = lazy(() => import('../pages/farmer/GrievanceHistoryPage'));
const EntitlementCenter = lazy(() => import('../pages/farmer/entitlements/EntitlementCenter'));
const DocumentIntelligencePage = lazy(() => import('../pages/farmer/DocumentIntelligencePage'));

const BankDashboard = lazy(() => import('../pages/bank/BankDashboard'));
const FarmerSearchPage = lazy(() => import('../pages/bank/FarmerSearchPage'));
const LandVerificationPage = lazy(() => import('../pages/bank/LandVerificationPage'));
const ApplicationAuditPage = lazy(() => import('../pages/bank/ApplicationAuditPage'));

const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage'));

/**
 * Fallback loader displayed during lazy chunk resolution.
 *
 * @returns {JSX.Element}
 */
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center py-12" aria-busy="true">
      <Spinner size="lg" className="text-clay-500" />
    </div>
  );
}

/**
 * Central application routing table.
 * Configures public, farmer, bank officer, and wildcard 404 routes.
 *
 * @returns {JSX.Element} Application route tree
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Farmer Portal Pages */}
        <Route
          path="/farmer"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="farmer">
                <FarmerLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<FarmerDashboard />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="land" element={<LandRecordsPage />} />
          <Route path="loans" element={<LoanLedgerPage />} />
          <Route path="discrepancies" element={<DiscrepanciesPage />} />
          <Route path="grievances" element={<GrievanceHistoryPage />} />
          <Route path="entitlements" element={<EntitlementCenter />} />
          <Route path="documents" element={<DocumentIntelligencePage />} />
        </Route>

        {/* Bank Officer Portal Pages */}
        <Route
          path="/bank"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="bank">
                <BankLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<BankDashboard />} />
          <Route path="dashboard" element={<BankDashboard />} />
          <Route path="farmers" element={<FarmerSearchPage />} />
          <Route path="land-verification" element={<LandVerificationPage />} />
          <Route path="applications" element={<ApplicationAuditPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
