import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Landmark, ShieldAlert, Globe, ArrowRight, Check } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { LanguageContext } from '../../context/LanguageContext';
import { farmers } from '../../constants/mockData';
import { DEMO_HERO_FARMER_ID, DEFAULT_OFFICER_NAME } from '../../constants';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import Footer from '../../components/common/Footer';

/**
 * LoginPage component
 * Provides 1-click persona switching (Farmer vs Bank Officer) with animated entry and feedback.
 *
 * @returns {JSX.Element} Login portal interface
 */
export default function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle('login.title', 'Demo Access Portal');
  const { isAuthenticated, role, loginAsFarmer, loginAsBank } = useAuth();
  const { language, toggleLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Read role from query param ?role=farmer|bank
  const paramRole = searchParams.get('role');
  const [activePersonaTab, setActivePersonaTab] = useState(
    paramRole === 'bank' ? 'bank' : 'farmer'
  );

  const [selectedFarmerId, setSelectedFarmerId] = useState(DEMO_HERO_FARMER_ID);
  const [selectedOfficer, setSelectedOfficer] = useState(DEFAULT_OFFICER_NAME);
  const [loadingRole, setLoadingRole] = useState(null);

  useEffect(() => {
    if (paramRole === 'bank' || paramRole === 'farmer') {
      setActivePersonaTab(paramRole);
    }
  }, [paramRole]);

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || (role === 'bank' ? '/bank' : '/farmer');
    return <Navigate to={from} replace />;
  }

  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    setLoadingRole('farmer');
    try {
      await loginAsFarmer(selectedFarmerId);
      const from = location.state?.from?.pathname || '/farmer';
      navigate(from, { replace: true });
    } finally {
      setLoadingRole(null);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setLoadingRole('bank');
    try {
      await loginAsBank(selectedOfficer);
      const from = location.state?.from?.pathname || '/bank';
      navigate(from, { replace: true });
    } finally {
      setLoadingRole(null);
    }
  };

  const officerOptions = [
    { name: 'Sunita Verma', role: 'Branch Credit Officer', branch: 'Wardha Lead Branch' },
    { name: 'Rajesh Khurana', role: 'Lead Bank Verifier', branch: 'Yavatmal District Office' },
    { name: 'Meenakshi Iyer', role: 'Chief Auditor', branch: 'Nagpur Regional Hub' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 bg-grain">
      {/* Top Header with slide-down entrance */}
      <header className="sticky top-0 z-40 bg-paper-50/95 backdrop-blur-md border-b border-indigo-900 px-4 sm:px-8 py-3.5 flex items-center justify-between animate-slide-down">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-clay-500 border border-indigo-900 flex items-center justify-center text-white font-serif font-bold text-lg">
            क
          </div>
          <span className="font-serif font-bold text-lg text-indigo-900">
            {t('common.appName', 'KisanSetu')}
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          aria-label={`Switch to ${language === 'hi' ? 'English' : 'Hindi'}`}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-900 bg-paper-100 border border-indigo-900 rounded-sm hover:bg-paper-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
        >
          <Globe className="w-3.5 h-3.5 text-clay-500" />
          <span className="transition-opacity duration-150">{language === 'hi' ? 'EN' : 'हिंदी'}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-up">
          <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block mb-1">
            {t('login.eyebrow', 'Sandbox Simulation Access')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 tracking-tight">
            {t('login.title', 'Choose Persona to Enter KisanSetu')}
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-2">
            {t('login.subline', 'Instant 1-click access with pre-configured synthetic profiles. No password required for demo.')}
          </p>
        </div>

        {/* Mobile Persona Switcher Tabs (<768px) */}
        <div className="md:hidden flex border-b-2 border-indigo-900 mb-6" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activePersonaTab === 'farmer'}
            onClick={() => setActivePersonaTab('farmer')}
            className={`flex-1 min-h-[44px] py-2.5 text-center text-sm font-bold border-b-2 transition-colors ${
              activePersonaTab === 'farmer'
                ? 'border-clay-500 text-clay-500 bg-paper-100'
                : 'border-transparent text-ink-muted hover:text-indigo-900'
            }`}
          >
            {t('login.farmerCardTitle', 'Farmer Console')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePersonaTab === 'bank'}
            onClick={() => setActivePersonaTab('bank')}
            className={`flex-1 min-h-[44px] py-2.5 text-center text-sm font-bold border-b-2 transition-colors ${
              activePersonaTab === 'bank'
                ? 'border-clay-500 text-clay-500 bg-paper-100'
                : 'border-transparent text-ink-muted hover:text-indigo-900'
            }`}
          >
            {t('login.bankCardTitle', 'Bank Officer Console')}
          </button>
        </div>

        {/* Two Persona Panels with 120ms staggered fade-up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Farmer Persona Panel */}
          <Panel
            hoverEffect
            className={`flex flex-col justify-between animate-fade-up ${
              loadingRole === 'farmer' ? 'animate-pulse-once border-clay-500' : ''
            } ${activePersonaTab !== 'farmer' ? 'hidden md:flex' : 'flex'}`}
            style={{ animationDelay: '0ms' }}
          >
            <div>
              <div className="w-12 h-12 rounded-sm bg-clay-100 border border-clay-500 text-clay-500 flex items-center justify-center mb-4">
                <Sprout className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-bold font-serif text-indigo-900 mb-1">
                {t('login.farmerCardTitle', 'Farmer Portal')}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mb-5">
                {t('login.farmerCardDesc', 'Inspect your land title, loan ledger, and live entitlement calculations.')}
              </p>

              <form onSubmit={handleFarmerSubmit} className="space-y-4">
                <div>
                  <span className="block text-xs uppercase font-bold tracking-wider text-clay-500 mb-2">
                    {t('login.farmerSelectLabel', 'Select Farmer Profile (Demo)')}
                  </span>

                  {/* Profile Cards Selection */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {farmers.slice(0, 5).map((f) => {
                      const isSelected = selectedFarmerId === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFarmerId(f.id)}
                          className={`p-3 rounded-sm border cursor-pointer transition-all duration-150 flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-clay-100/60 border-clay-500 shadow-sm'
                              : 'bg-paper-100/60 border-paper-200 hover:bg-paper-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-paper-200 border border-indigo-900 font-bold flex items-center justify-center text-indigo-900 font-serif">
                              {f.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-indigo-900 text-sm">{f.name}</div>
                              <div className="text-ink-muted">
                                {f.village}, {f.district}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-clay-500 bg-paper-50 px-2 py-0.5 rounded border border-paper-200">
                              {f.id}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-clay-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loadingRole === 'farmer'}
                    className="w-full"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    {t('login.loginFarmerBtn', 'Enter as Farmer')}
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-paper-200 flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t('login.newRegistration', 'New Farmer?')}</span>
              <Link
                to="/register"
                className="text-clay-500 font-bold hover:underline"
              >
                {t('login.registerLink', 'Register New Profile →')}
              </Link>
            </div>
          </Panel>

          {/* Bank Officer Persona Panel */}
          <Panel
            hoverEffect
            className={`flex flex-col justify-between animate-fade-up ${
              loadingRole === 'bank' ? 'animate-pulse-once border-clay-500' : ''
            } ${activePersonaTab !== 'bank' ? 'hidden md:flex' : 'flex'}`}
            style={{ animationDelay: '120ms' }}
          >
            <div>
              <div className="w-12 h-12 rounded-sm bg-indigo-100 border border-indigo-900 text-indigo-900 flex items-center justify-center mb-4">
                <Landmark className="w-6 h-6 text-indigo-900" />
              </div>

              <h2 className="text-2xl font-bold font-serif text-indigo-900 mb-1">
                {t('login.bankCardTitle', 'Bank Officer Console')}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mb-5">
                {t('login.bankCardDesc', 'Fast farmer search, digital cadastre cross-check, and application audit.')}
              </p>

              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div>
                  <span className="block text-xs uppercase font-bold tracking-wider text-clay-500 mb-2">
                    {t('login.bankSelectLabel', 'Select Branch Officer (Demo)')}
                  </span>

                  {/* Officer Cards Selection */}
                  <div className="space-y-2">
                    {officerOptions.map((off) => {
                      const isSelected = selectedOfficer === off.name;
                      return (
                        <div
                          key={off.name}
                          onClick={() => setSelectedOfficer(off.name)}
                          className={`p-3 rounded-sm border cursor-pointer transition-all duration-150 flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-indigo-100/60 border-indigo-900 shadow-sm'
                              : 'bg-paper-100/60 border-paper-200 hover:bg-paper-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-900 text-paper-50 font-bold flex items-center justify-center text-xs font-serif">
                              {off.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-indigo-900 text-sm">{off.name}</div>
                              <div className="text-ink-muted">{off.role} • {off.branch}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-900" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    loading={loadingRole === 'bank'}
                    className="w-full"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    {t('login.loginBankBtn', 'Enter as Bank Officer')}
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-paper-200 text-xs text-ink-muted">
              {t('login.officerRoleHint', 'Role: Branch Credit Officer & Lead Bank Cadastre Verifier')}
            </div>
          </Panel>
        </div>

        {/* Demo Disclaimer */}
        <div className="mt-8 p-4 bg-paper-100 border border-indigo-900 rounded-sm flex items-center justify-center gap-2 text-xs text-ink-muted text-center shadow-hard-sm animate-fade-in">
          <ShieldAlert className="w-4 h-4 text-ochre-600 shrink-0" />
          <span>{t('login.demoNotice', 'Demo Prototype: All farmer and bank records are synthetic. No real Aadhaar or bank credentials required.')}</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
