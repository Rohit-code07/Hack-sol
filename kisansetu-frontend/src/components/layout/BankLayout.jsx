import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Globe, LogOut, UserCheck } from 'lucide-react';
import BankRail from '../common/BankRail';
import Footer from '../common/Footer';
import useAuth from '../../hooks/useAuth';
import { LanguageContext } from '../../context/LanguageContext';
import Stamp from '../common/Stamp';
import PageTransition from '../motion/PageTransition';

/**
 * Main layout for Bank Officer Console with collapsible rail and page transitions.
 */
export default function BankLayout() {
  const { t } = useTranslation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { officerName, branchName, role, logout } = useAuth();
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  // Header scroll detection for subtle shadow (M1.3)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pinned sidebar state persisted in localStorage
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem('ks_bank_rail_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const handleTogglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ks_bank_rail_pinned', String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 bg-grain">
      {/* Skip to Content for Screen Readers */}
      <a
        href="#bank-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-saffron-400 focus:text-indigo-900 focus:font-bold focus:border focus:border-indigo-900 focus:shadow-hard"
      >
        {t('common.skipToContent', 'Skip to main content')}
      </a>

      {/* Collapsible Rail / Drawer */}
      <BankRail
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
        isPinned={isPinned}
        onTogglePin={handleTogglePin}
      />

      {/* Main Container Offset by Rail on Desktop (72px or 240px if pinned) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ease-out-expo ${
          isPinned ? 'lg:pl-60' : 'lg:pl-[72px]'
        }`}
      >
        {/* Top Header */}
        <header
          className={`sticky top-0 z-30 bg-paper-50/95 backdrop-blur-md border-b border-indigo-900 h-16 flex items-center justify-between px-4 sm:px-8 transition-shadow duration-200 ${
            isScrolled ? 'shadow-sm' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation drawer"
              className="lg:hidden min-h-[44px] min-w-[44px] p-2 rounded-sm text-indigo-900 hover:bg-paper-100 border border-indigo-900 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-indigo-900 hidden sm:inline">
                {t('bank.title', 'BankSetu Console')}
              </span>
              <Stamp status="VERIFIED" label={branchName || 'Wardha Lead Branch'} size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Officer Identification from Auth Context */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-paper-100 border border-paper-200 rounded-sm">
              <UserCheck className="w-4 h-4 text-clay-500" />
              <span className="text-xs font-semibold text-indigo-900">
                {officerName || 'Sunita Verma'}
              </span>
              <span className="text-[10px] text-ink-muted uppercase font-bold">
                ({role === 'bank' ? 'Credit Officer' : role})
              </span>
            </div>

            {/* Language Switch with smooth label cross-fade (M1.5) */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={`Switch to ${language === 'hi' ? 'English' : 'Hindi'}`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-900 bg-paper-100 border border-indigo-900 rounded-sm hover:bg-paper-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
            >
              <Globe className="w-3.5 h-3.5 text-clay-500" />
              <span key={language} className="animate-fade-in inline-block [animation-duration:150ms]">
                {language === 'hi' ? 'EN' : 'हिंदी'}
              </span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t('common.logout', 'Logout')}
              className="min-h-[44px] min-w-[44px] p-2 text-indigo-900 hover:text-rust-600 hover:bg-paper-100 rounded-sm transition-colors border border-transparent hover:border-paper-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 inline-flex items-center justify-center"
              title={t('common.logout', 'Logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Container (max-w-[1280px]) with PageTransition (M0.4, M4.3) */}
        <main
          id="bank-main-content"
          tabIndex={-1}
          className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8 focus:outline-none"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <Footer />
      </div>
    </div>
  );
}
