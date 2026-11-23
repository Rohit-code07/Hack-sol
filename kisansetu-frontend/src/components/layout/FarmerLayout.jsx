import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopNav from '../common/TopNav';
import Footer from '../common/Footer';
import PageTransition from '../motion/PageTransition';

/**
 * Main layout for Farmer Portal with accessible skip-link and animated page transitions.
 */
export default function FarmerLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 bg-grain">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-saffron-400 focus:text-indigo-900 focus:font-bold focus:border focus:border-indigo-900 focus:shadow-hard"
      >
        {t('common.skipToContent', 'Skip to main content')}
      </a>

      {/* Top Navigation */}
      <TopNav />

      {/* Main Centered Content (Max-width 960px for editorial reading flow) */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 focus:outline-none"
      >
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
