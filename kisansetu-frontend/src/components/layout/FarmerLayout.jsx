import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopNav from '../common/TopNav';
import Footer from '../common/Footer';
import PageTransition from '../motion/PageTransition';
import SideFarmerGutters from './SideFarmerGutters';
import KisanAiAssistant from '../ai/KisanAiAssistant';

/**
 * Main layout for Farmer Portal with accessible skip-link,
 * animated page transitions, and background security paper watermarks.
 * 
 * Note: Side watermarks are strictly bounded within the main content wrapper
 * (never fixed to viewport, zero footer overlap, authentic paper grain blending).
 */
export default function FarmerLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 bg-grain relative overflow-x-hidden">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-saffron-400 focus:text-indigo-900 focus:font-bold focus:border focus:border-indigo-900 focus:shadow-hard"
      >
        {t('common.skipToContent', 'Skip to main content')}
      </a>

      {/* Top Navigation */}
      <TopNav />

      {/* 
        Main Page Content Area Wrapper 
        Contains both the central reading column AND the integrated 
        side background watermarks that scroll naturally and NEVER touch the footer.
      */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto relative min-h-[calc(100vh-280px)]">
        {/* Integrated Background Farmer & Official Watermarks (Strictly bounded inside wrapper) */}
        <SideFarmerGutters />

        {/* Main Centered Content (Expands naturally to full content height, zero clipping) */}
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full max-w-[1020px] 2xl:max-w-[1080px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-16 focus:outline-none relative z-10"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* KisanSetu Grounded Policy AI Assistant */}
      <KisanAiAssistant />

      {/* Footer - 100% clean, never overlapped */}
      <Footer />
    </div>
  );
}
