import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import LanguageProvider from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import OfflineBanner from './components/feedback/OfflineBanner';
import ErrorBoundary from './components/feedback/ErrorBoundary';

/**
 * Root Application Component.
 * Orchestrates error boundaries, router, state providers, and global feedback widgets.
 *
 * @returns {JSX.Element} KisanSetu web application
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <OfflineBanner />
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
