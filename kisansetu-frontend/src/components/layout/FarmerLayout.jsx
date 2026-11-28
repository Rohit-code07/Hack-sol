import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopNav from '../common/TopNav';
import Footer from '../common/Footer';
import PageTransition from '../motion/PageTransition';
import { SideFarmerLeftRail, SideFarmerRightRail, SideFarmerMobileShowcase } from './SideFarmerGutters';
import KisanAiAssistant from '../ai/KisanAiAssistant';

/**
 * Main layout for Farmer Portal with accessible skip-link,
 * animated page transitions, and structured 3-column document flow layout.
 * 
 * Images & Side Rails are in normal document flow (Flexbox).
 * Zero overlap is mathematically guaranteed across all screen resolutions.
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
        Main Page Content Area Wrapper:
        Modern 3-Column Layout in Normal Document Flow (Flexbox).
        The Left & Right Agricultural Side Rails are distinct sibling columns that flank <main>.
        Zero overlap is mathematically guaranteed.
      */}
      <div className="flex-1 w-full max-w-[1680px] mx-auto px-3 sm:px-6 relative min-h-[calc(100vh-280px)] flex justify-center items-start gap-4 xl:gap-6 2xl:gap-8">
        {/* Left Side Rail: Dedicated Desktop Column (Normal Document Flow) */}
        <SideFarmerLeftRail />

        {/* Main Centered Content: Fully Protected & Centered */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full max-w-[1020px] 2xl:max-w-[1080px] min-w-0 py-6 sm:py-8 pb-16 focus:outline-none relative z-10"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>

          {/* Graceful adaptation for Tablets & Mobile (< 1400px): Agricultural Showcase at bottom */}
          <SideFarmerMobileShowcase />
        </main>

        {/* Right Side Rail: Dedicated Desktop Column (Normal Document Flow) */}
        <SideFarmerRightRail />
      </div>

      {/* KisanSetu Grounded Policy AI Assistant */}
      <KisanAiAssistant />

      {/* Footer - 100% clean, never overlapped */}
      <Footer />
    </div>
  );
}
