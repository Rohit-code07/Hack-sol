import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Landmark, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { LanguageContext } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import Footer from '../../components/common/Footer';

/**
 * LoginPage component
 * Provides genuine user authentication against the Spring Boot backend.
 *
 * @returns {JSX.Element} Login portal interface
 */
export default function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle('login.title', 'User Login');
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

  const [farmerUsername, setFarmerUsername] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [bankUsername, setBankUsername] = useState('bank_officer');
  const [bankPassword, setBankPassword] = useState('Password@123');
  const [loadingRole, setLoadingRole] = useState(null);
  const [loginError, setLoginError] = useState(null);

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
    if (!farmerUsername.trim()) {
      setLoginError(t('login.enterFarmerUsername', 'Please enter your username or registered mobile number.'));
      return;
    }
    setLoadingRole('farmer');
    setLoginError(null);
    try {
      const res = await loginAsFarmer(farmerUsername.trim(), farmerPassword);
      if (res && res.success) {
        const from = location.state?.from?.pathname || '/farmer';
        navigate(from, { replace: true });
      } else {
        setLoginError(res?.message || 'Invalid credentials or user not registered.');
      }
    } catch (err) {
      setLoginError(err.message || 'Unable to connect to authentication server');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankUsername.trim()) {
      setLoginError(t('login.enterBankUsername', 'Please enter your officer username.'));
      return;
    }
    setLoadingRole('bank');
    setLoginError(null);
    try {
      const res = await loginAsBank(bankUsername.trim(), bankPassword);
      if (res && res.success) {
        const from = location.state?.from?.pathname || '/bank';
        navigate(from, { replace: true });
      } else {
        setLoginError(res?.message || 'Invalid officer credentials.');
      }
    } catch (err) {
      setLoginError(err.message || 'Unable to connect to authentication server');
    } finally {
      setLoadingRole(null);
    }
  };

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
            {t('login.eyebrow', 'Secure Login Access')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-indigo-900 tracking-tight">
            {t('login.title', 'Sign in to KisanSetu')}
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-2">
            {t('login.subline', 'Enter your registered credentials to access your digital agricultural portal.')}
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-3 bg-rust-100 border border-rust-600 rounded-sm text-xs font-semibold text-rust-600 text-center animate-shake">
            {loginError}
          </div>
        )}

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
            {t('login.farmerCardTitle', 'Farmer Portal')}
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
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-clay-500 mb-1">
                      {t('login.farmerUserLabel', 'Mobile Number / Username')}
                    </label>
                    <input
                      type="text"
                      required
                      value={farmerUsername}
                      onChange={(e) => setFarmerUsername(e.target.value)}
                      placeholder={t('login.farmerUserPlaceholder', 'e.g. 9827100001 or username')}
                      className="w-full px-3 py-2 text-sm bg-paper-100 border border-indigo-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-clay-500 text-indigo-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-clay-500 mb-1">
                      {t('login.farmerPassLabel', 'Password')}
                    </label>
                    <input
                      type="password"
                      required
                      value={farmerPassword}
                      onChange={(e) => setFarmerPassword(e.target.value)}
                      placeholder={t('login.farmerPassPlaceholder', 'Enter account password')}
                      className="w-full px-3 py-2 text-sm bg-paper-100 border border-indigo-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-clay-500 text-indigo-900"
                    />
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
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-clay-500 mb-1">
                      {t('login.bankUserLabel', 'Bank Officer Username')}
                    </label>
                    <input
                      type="text"
                      required
                      value={bankUsername}
                      onChange={(e) => setBankUsername(e.target.value)}
                      placeholder={t('login.bankUserPlaceholder', 'e.g. officer_username')}
                      className="w-full px-3 py-2 text-sm bg-paper-100 border border-indigo-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 text-indigo-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-clay-500 mb-1">
                      {t('login.bankPassLabel', 'Password')}
                    </label>
                    <input
                      type="password"
                      required
                      value={bankPassword}
                      onChange={(e) => setBankPassword(e.target.value)}
                      placeholder={t('login.bankPassPlaceholder', 'Enter officer password')}
                      className="w-full px-3 py-2 text-sm bg-paper-100 border border-indigo-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 text-indigo-900"
                    />
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

        {/* Security & Verification Disclaimer */}
        <div className="mt-8 p-4 bg-paper-100 border border-indigo-900 rounded-sm flex items-center justify-center gap-2 text-xs text-ink-muted text-center shadow-hard-sm animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-clay-500 shrink-0" />
          <span>{t('login.securityNotice', 'Official System Notice: All farmer and agricultural credit records are strictly user-managed and authenticated.')}</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
