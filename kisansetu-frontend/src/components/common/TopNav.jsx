import React, { useContext, useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  MapPin,
  CreditCard,
  AlertTriangle,
  FileText,
  FileCheck,
  Gift,
  Globe,
  LogOut,
  Landmark,
  MoreHorizontal,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { LanguageContext } from '../../context/LanguageContext';
import Drawer from './Drawer';
import useReducedMotion from '../../hooks/useReducedMotion';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Editorial Top Navigation Bar with sliding active indicators, scroll shadow, and mobile bottom bar.
 */
export default function TopNav() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll for header shadow (M1.3)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = useMemo(
    () => [
      { to: '/farmer', label: t('nav.home', 'Overview'), icon: Home, end: true },
      { to: '/farmer/land', label: t('nav.land', 'Land Records'), icon: MapPin },
      { to: '/farmer/loans', label: t('nav.loans', 'Credit Ledger'), icon: CreditCard },
      { to: '/farmer/discrepancies', label: t('nav.discrepancies', 'Discrepancies'), icon: AlertTriangle },
      { to: '/farmer/entitlements', label: t('nav.entitlements', 'Entitlements'), icon: Gift },
      { to: '/farmer/documents', label: language === 'hi' ? 'दस्तावेज़ एआई' : 'AI Documents', icon: FileCheck },
      { to: '/farmer/grievances', label: t('nav.grievances', 'Grievances'), icon: FileText },
    ],
    [t, language]
  );

  const mobilePrimaryLinks = useMemo(
    () => [
      { to: '/farmer', label: t('nav.home', 'Home'), icon: Home, end: true },
      { to: '/farmer/land', label: t('nav.land', 'Land'), icon: MapPin },
      { to: '/farmer/loans', label: t('nav.loans', 'Loans'), icon: CreditCard },
      { to: '/farmer/discrepancies', label: t('nav.discrepancies', 'Alerts'), icon: AlertTriangle },
    ],
    [t, language]
  );

  // Desktop active tab underline calculation (M1.3)
  const navRefs = useRef({});
  const [desktopIndicator, setDesktopIndicator] = useState({ left: 0, width: 0, ready: false });

  useIsomorphicLayoutEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navLinks.find((l) =>
      l.end ? currentPath === l.to : currentPath.startsWith(l.to)
    );
    if (activeItem && navRefs.current[activeItem.to]) {
      const el = navRefs.current[activeItem.to];
      setDesktopIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
        ready: true,
      });
    }
  }, [location.pathname, navLinks, language]);

  // Mobile bottom nav active column indicator (M1.4)
  const mobileActiveIndex = useMemo(() => {
    if (
      location.pathname.startsWith('/farmer/entitlements') ||
      location.pathname.startsWith('/farmer/documents') ||
      location.pathname.startsWith('/farmer/grievances')
    ) {
      return 4; // 'More' sheet
    }
    const idx = mobilePrimaryLinks.findIndex((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    return idx >= 0 ? idx : 0;
  }, [location.pathname, mobilePrimaryLinks]);

  return (
    <>
      {/* Sticky Desktop & Tablet Header */}
      <header
        className={`sticky top-0 z-40 bg-paper-50/95 backdrop-blur-md border-b border-indigo-900 transition-shadow duration-200 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <NavLink to="/farmer" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-sm bg-clay-500 border border-indigo-900 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                  क
                </div>
                <div>
                  <span className="font-serif font-bold text-lg text-indigo-900 tracking-tight block leading-tight">
                    {t('common.appName', 'KisanSetu')}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-clay-500 block leading-none font-semibold">
                    {t('common.appTagline', 'Farmer Entitlement Bridge')}
                  </span>
                </div>
              </NavLink>
            </div>

            {/* Desktop Navigation Tabs with Sliding Underline (M1.3) */}
            <nav className="hidden md:flex items-center space-x-1 relative" aria-label="Farmer Navigation">
              {/* Sliding underline element */}
              <div
                className={`absolute bottom-0 h-0.5 bg-saffron-400 pointer-events-none ${
                  prefersReducedMotion ? 'transition-none' : 'transition-all duration-250 ease-out-expo'
                } ${desktopIndicator.ready ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  transform: `translateX(${desktopIndicator.left}px)`,
                  width: `${desktopIndicator.width}px`,
                }}
                aria-hidden="true"
              />

              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  ref={(el) => {
                    if (el) navRefs.current[item.to] = el;
                  }}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-colors relative ${
                      isActive ? 'text-clay-500 font-bold' : 'text-indigo-900 hover:text-clay-500'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Language Toggle (M1.5) & Logout */}
            <div className="flex items-center gap-2">
              <Link
                to="/login?role=bank"
                className="min-h-[44px] hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-indigo-900 bg-paper-100 border border-indigo-900 rounded-sm hover:bg-paper-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
                title={language === 'hi' ? 'बैंक अधिकारी पोर्टल' : 'Bank Officer Portal'}
              >
                <Landmark className="w-3.5 h-3.5 text-indigo-900" />
                <span>{language === 'hi' ? 'बैंक पोर्टल' : 'Bank Portal'}</span>
              </Link>

              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={`Switch to ${language === 'hi' ? 'English' : 'Hindi'}`}
                className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-900 bg-paper-100 border border-indigo-900 rounded-sm hover:bg-paper-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 inline-flex items-center justify-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-clay-500" />
                <span key={language} className="animate-fade-in inline-block [animation-duration:150ms]">
                  {language === 'hi' ? 'EN' : 'हिंदी'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                aria-label={t('common.logout', 'Logout')}
                className="min-h-[44px] min-w-[44px] p-2 text-indigo-900 hover:text-rust-600 hover:bg-paper-100 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 inline-flex items-center justify-center"
                title={t('common.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Fixed Navigation Bar with sliding pill indicator (M1.4) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-50 border-t border-indigo-900 shadow-hard-lg pb-[max(0.25rem,env(safe-area-inset-bottom))]"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-5 items-center justify-items-center pt-1 relative">
          {/* Active pill background sliding under the active column */}
          <div
            className={`absolute top-1 bottom-1 bg-paper-100 border border-indigo-900 rounded-sm pointer-events-none ${
              prefersReducedMotion ? 'transition-none' : 'transition-transform duration-250 ease-out-expo'
            }`}
            style={{
              width: 'calc(20% - 8px)',
              left: '4px',
              transform: `translateX(${mobileActiveIndex * 100}%)`,
            }}
            aria-hidden="true"
          />

          {mobilePrimaryLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative z-10 min-h-[44px] w-full flex flex-col items-center justify-center text-xs font-medium transition-colors ${
                  isActive ? 'text-clay-500 font-bold' : 'text-indigo-900/80 hover:text-indigo-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform duration-150 ${
                    isActive ? 'scale-[1.06] stroke-[2.2]' : 'stroke-[1.6]'
                  }`}
                />
                <span className="truncate max-w-[64px] text-center">{item.label}</span>
              </NavLink>
            );
          })}

          {/* "More" Trigger Button on Mobile */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-label={t('nav.more', 'More Options')}
            className={`relative z-10 min-h-[44px] w-full flex flex-col items-center justify-center text-xs font-medium text-indigo-900/80 hover:text-indigo-900 ${
              mobileActiveIndex === 4 ? 'text-clay-500 font-bold' : ''
            }`}
          >
            <MoreHorizontal
              className={`w-5 h-5 mb-0.5 transition-transform duration-150 ${
                mobileActiveIndex === 4 ? 'scale-[1.06] stroke-[2.2]' : ''
              }`}
            />
            <span>{t('nav.more', 'More')}</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Drawer / Bottom Sheet */}
      <Drawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title={t('nav.moreServices', 'All Services & Portals')}
      >
        <div className="space-y-3 py-2">
          <Link
            to="/farmer/entitlements"
            onClick={() => setIsMoreOpen(false)}
            className="p-3.5 bg-paper-100 border border-indigo-900 rounded-sm flex items-center justify-between hover:bg-paper-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-clay-500" />
              <div>
                <h3 className="font-bold text-sm text-indigo-900">
                  {t('nav.entitlements', 'Entitlement Center')}
                </h3>
                <p className="text-xs text-ink-muted">
                  KCC calculator, MSP verifier & PMFBY insurance
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/farmer/documents"
            onClick={() => setIsMoreOpen(false)}
            className="p-3.5 bg-paper-100 border border-indigo-900 rounded-sm flex items-center justify-between hover:bg-paper-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-clay-500" />
              <div>
                <h3 className="font-bold text-sm text-indigo-900">
                  {language === 'hi' ? 'दस्तावेज़ एआई स्कैनर' : 'AI Document Intelligence'}
                </h3>
                <p className="text-xs text-ink-muted">
                  {language === 'hi' ? 'ऋण पत्र, खसरा खतौनी, बीमा रसीद विश्लेषण' : 'Scan loan letters, land records, insurance slips'}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/farmer/grievances"
            onClick={() => setIsMoreOpen(false)}
            className="p-3.5 bg-paper-100 border border-indigo-900 rounded-sm flex items-center justify-between hover:bg-paper-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-clay-500" />
              <div>
                <h3 className="font-bold text-sm text-indigo-900">
                  {t('nav.grievances', 'Grievance Redressal')}
                </h3>
                <p className="text-xs text-ink-muted">
                  File disputes, download PDF acknowledgment slips
                </p>
              </div>
            </div>
          </Link>

          <div className="pt-4 border-t border-paper-200">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full min-h-[44px] px-4 py-2 border border-rust-600 bg-rust-100 text-rust-600 rounded-sm font-semibold text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('common.logout', 'Logout')}</span>
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
