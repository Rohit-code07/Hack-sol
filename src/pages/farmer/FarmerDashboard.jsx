import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  CreditCard,
  Gift,
  FileText,
  ChevronRight,
  Clock,
  ShieldAlert,
  CloudSun,
  Sprout,
  Droplets,
  PhoneCall,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import useDiscrepancies from '../../hooks/useDiscrepancies';
import { getMe } from '../../services/farmerService';
import { getEntitlements } from '../../services/entitlementService';
import { formatCurrency } from '../../utils/formatters';
import { formatRelativeTime } from '../../utils/relativeTime';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Panel from '../../components/common/Panel';
import Stamp from '../../components/common/Stamp';
import Button from '../../components/common/Button';
import TermHint from '../../components/common/TermHint';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import AlertRibbon from '../../components/feedback/AlertRibbon';
import CountUp from '../../components/motion/CountUp';
import useReducedMotion from '../../hooks/useReducedMotion';
import cadastreSeal from '../../assets/cadastre-seal.svg';
import kccSeal from '../../assets/kcc-seal.svg';
import pmfbySeal from '../../assets/pmfby-seal.svg';
import grievanceSeal from '../../assets/grievance-seal.svg';
import farmerVignette1 from '../../assets/farmer-vignette-1.svg';
import emblemSvg from '../../assets/emblem.svg';

/**
 * Farmer Overview Dashboard with Haq Gap Hero Card, live counters, and timeline motion.
 */
export default function FarmerDashboard() {
  const { t, i18n } = useTranslation();
  const { farmerId } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle('farmer.dashboard', 'Farmer Overview');

  const fetchProfile = useCallback(() => getMe(farmerId || 'FRM-0003'), [farmerId]);
  const fetchEntitlementsData = useCallback(() => getEntitlements(farmerId || 'FRM-0003'), [farmerId]);

  const {
    data: farmer,
    loading: farmerLoading,
    error: farmerError,
    retry: retryProfile,
  } = useAsync(fetchProfile, true, [farmerId]);

  const {
    data: entitlements,
    loading: entLoading,
    error: entError,
    retry: retryEntitlements,
  } = useAsync(fetchEntitlementsData, true, [farmerId]);

  const {
    openDiscrepancies,
    hasDiscrepancies,
    loading: discLoading,
  } = useDiscrepancies(farmerId || 'FRM-0003');

  const isLoading = farmerLoading || entLoading || discLoading;

  // Calculate totals
  const entList = Array.isArray(entitlements) ? entitlements : [];
  const totalDue = entList.reduce((acc, curr) => acc + (Number(curr.amountDue) || 0), 0);
  const totalPaid = entList.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
  const pendingBalance = Math.max(0, totalDue - totalPaid);
  const disbursementRatio = totalDue > 0 ? Math.min(1, totalPaid / totalDue) : 0;
  const disbursementPercent = Math.round(disbursementRatio * 100);

  const topDiscrepancy = openDiscrepancies[0];

  // Dynamic audit timeline events
  const timelineEvents = useMemo(() => {
    const now = new Date();
    return [
      {
        text: t('farmer.activity1', 'PM-Kisan 19th installment credited via DBT'),
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        dotColor: 'bg-clay-500',
      },
      {
        text: t('farmer.activity2', 'Land parcel survey name discrepancy flagged in Bhulekh'),
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dotColor: 'bg-rust-600',
      },
      {
        text: t('farmer.activity3', 'KCC credit limit revised based on new soybean scale of finance'),
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        dotColor: 'bg-sage-600',
      },
      {
        text: t('farmer.activity4', 'Annual crop insurance policy renewed under PMFBY'),
        date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        dotColor: 'bg-indigo-900',
      },
    ];
  }, [t]);

  if (farmerError || entError) {
    return (
      <ErrorState
        title={t('errors.loadFailed', 'Unable to load farmer profile')}
        onRetry={() => {
          retryProfile();
          retryEntitlements();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        eyebrow={t('farmer.greeting', 'Welcome, Farmer')}
        title={farmer?.name || 'Ramesh Kumar'}
        subtitle={`${farmer?.village || 'Chandrapur Khurd'}, ${farmer?.district || 'Wardha'}`}
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-900 bg-paper-100 border border-paper-200 px-2.5 py-1.5 rounded-sm">
              {farmer?.id || 'FRM-0003'}
            </span>
            <Stamp status={farmer?.status || 'ACTIVE'} size="md" />
          </div>
        }
      />

      {/* Alert Ribbon with slide-down and single pulse ring (M3.1, M5.3) */}
      {hasDiscrepancies && (
        <AlertRibbon count={openDiscrepancies.length} />
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton variant="card" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>
      ) : (
        <>
          {/* M3.1: Haq Gap Hero Card with transparent Annadata watermark */}
          <Panel accent="clay" className="shadow-hard space-y-4 relative overflow-hidden">
            <div className="absolute right-3 top-3 w-16 h-16 pointer-events-none opacity-20 mix-blend-multiply hidden sm:block">
              <img src={farmerVignette1} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-200 pb-3">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block">
                  {t('farmer.entitlementGap', 'Entitlement Audit • हक का संतुलन')}
                </span>
                <h2 className="text-lg font-bold font-serif text-indigo-900 mt-0.5">
                  {t('farmer.haqGapTitle', 'Direct Entitlement Fulfillment Overview')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink-muted">
                  {disbursementPercent}% {t('farmer.disbursed', 'Disbursed')}
                </span>
                <Stamp status={pendingBalance === 0 ? 'RESOLVED' : 'PENDING'} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-ink-muted block">
                  {t('farmer.kpiTotalDue', 'Total Assessed')}
                </span>
                <div className="text-xl sm:text-2xl font-bold font-serif text-indigo-900 mt-1">
                  <CountUp
                    value={totalDue}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-sage-600 block">
                  {t('farmer.kpiDisbursed', 'Received / Disbursed')}
                </span>
                <div className="text-xl sm:text-2xl font-bold font-serif text-sage-600 mt-1">
                  <CountUp
                    value={totalPaid}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block">
                  {t('farmer.kpiRemaining', 'Pending Haq Gap')}
                </span>
                <div className="text-xl sm:text-2xl font-bold font-serif text-clay-500 mt-1">
                  <CountUp
                    value={pendingBalance}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                </div>
              </div>
            </div>

            {/* ScaleX progress bar (M3.1) */}
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-full bg-paper-200 rounded-sm overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full bg-clay-500 origin-left ${
                    prefersReducedMotion ? 'transition-none' : 'transition-transform duration-900 ease-out'
                  }`}
                  style={{
                    transform: `scaleX(${disbursementRatio})`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>0%</span>
                <span>{disbursementPercent}% {t('farmer.progressSettled', 'settled to linked account')}</span>
                <span>100%</span>
              </div>
            </div>
          </Panel>

          {/* Profile Strip */}
          <div className="bg-paper-100/80 border border-indigo-900 rounded-sm p-4 shadow-hard-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="uppercase font-bold tracking-wider text-clay-500 block text-[10px]">
                  {t('farmer.village', 'Village')}
                </span>
                <span className="font-semibold text-indigo-900 text-sm mt-0.5 block">
                  {farmer?.village || 'Chandrapur Khurd'}
                </span>
              </div>
              <div>
                <span className="uppercase font-bold tracking-wider text-clay-500 block text-[10px]">
                  {t('farmer.district', 'District / State')}
                </span>
                <span className="font-semibold text-indigo-900 text-sm mt-0.5 block">
                  {farmer?.district || 'Wardha'}, {farmer?.state || 'Maharashtra'}
                </span>
              </div>
              <div>
                <span className="uppercase font-bold tracking-wider text-clay-500 block text-[10px]">
                  {t('farmer.category', 'Social Category')}
                </span>
                <span className="font-semibold text-indigo-900 text-sm mt-0.5 block">
                  {farmer?.category || 'OBC'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="uppercase font-bold tracking-wider text-clay-500 block text-[10px]">
                    {t('farmer.dbtStatus', 'DBT Status')}
                  </span>
                  <TermHint term="DBT" />
                </div>
                <span className="font-semibold text-sage-600 text-sm mt-0.5 block">
                  {t('farmer.dbtActive', 'Active & Linked')}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Row with CountUp numbers & 60ms stagger (M3.1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              style={{ animationDelay: '0ms' }}
              className={prefersReducedMotion ? '' : 'animate-fade-up'}
            >
              <StatCard
                label={t('farmer.kpiTotalDue', 'Entitlement Assessed')}
                value={
                  <CountUp
                    value={totalDue}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                }
                helperText={t('farmer.kpiTotalDueSub', '3 government schemes linked')}
                accent="saffron"
              />
            </div>

            <div
              style={{ animationDelay: '60ms' }}
              className={prefersReducedMotion ? '' : 'animate-fade-up'}
            >
              <StatCard
                label={t('farmer.kpiDisbursed', 'Disbursed to Account')}
                value={
                  <CountUp
                    value={totalPaid}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                }
                helperText={t('farmer.kpiDisbursedSub', 'Direct benefit transfers credited')}
                accent="sage"
              />
            </div>

            <div
              style={{ animationDelay: '120ms' }}
              className={prefersReducedMotion ? '' : 'animate-fade-up'}
            >
              <StatCard
                label={t('farmer.kpiRemaining', 'Pending Balance')}
                value={
                  <CountUp
                    value={pendingBalance}
                    format={(val) => formatCurrency(val, i18n.language)}
                  />
                }
                helperText={t('farmer.kpiRemainingSub', 'Under process at treasury')}
                accent="clay"
              />
            </div>

            <div
              style={{ animationDelay: '180ms' }}
              className={prefersReducedMotion ? '' : 'animate-fade-up'}
            >
              <StatCard
                label={t('farmer.kpiAlerts', 'Discrepancies Flagged')}
                value={<CountUp value={openDiscrepancies.length} />}
                helperText={
                  hasDiscrepancies
                    ? t('farmer.kpiAlertsAction', 'Action required to avoid freeze')
                    : t('farmer.kpiAlertsClean', 'All records clean & verified')
                }
                accent={hasDiscrepancies ? 'rust' : 'indigo'}
              />
            </div>
          </div>

          {/* Task-Oriented Quick Actions (01 — 04) with stagger fade-up (M3.1) */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold tracking-wider text-clay-500">
                01 — 04 • {t('farmer.quickActions', 'Key Farmer Tasks')}
              </span>
              <div className="h-px bg-paper-200 flex-1" aria-hidden="true" />
            </div>

            <div className="border border-indigo-900 rounded-sm divide-y divide-paper-200 bg-paper-50 shadow-hard-sm">
              <Link
                to="/farmer/land"
                style={{ animationDelay: '60ms' }}
                className={`p-4 sm:p-5 flex items-center justify-between hover:bg-paper-100 transition-colors group ${
                  prefersReducedMotion ? '' : 'animate-fade-up'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-serif font-bold text-lg text-clay-500 w-6">01</span>
                  <img src={cadastreSeal} alt="" className="w-6 h-6 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-indigo-900 group-hover:text-clay-600 transition-colors">
                      {t('farmer.qaLand', 'Inspect Land Cadastre Records')}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {t('farmer.qaLandDesc', 'Verify your Khasra survey numbers and registered owner names in Bhulekh.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-900/60 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
              </Link>

              <Link
                to="/farmer/loans"
                style={{ animationDelay: '120ms' }}
                className={`p-4 sm:p-5 flex items-center justify-between hover:bg-paper-100 transition-colors group ${
                  prefersReducedMotion ? '' : 'animate-fade-up'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-serif font-bold text-lg text-clay-500 w-6">02</span>
                  <img src={kccSeal} alt="" className="w-6 h-6 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-indigo-900 group-hover:text-clay-600 transition-colors">
                      {t('farmer.qaLoans', 'Check Credit & KCC Standing')}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {t('farmer.qaLoansDesc', 'View bank outstanding, active limits, and overdue repayment schedules.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-900/60 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
              </Link>

              <Link
                to="/farmer/entitlements"
                style={{ animationDelay: '180ms' }}
                className={`p-4 sm:p-5 flex items-center justify-between hover:bg-paper-100 transition-colors group ${
                  prefersReducedMotion ? '' : 'animate-fade-up'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-serif font-bold text-lg text-clay-500 w-6">03</span>
                  <img src={pmfbySeal} alt="" className="w-6 h-6 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-indigo-900 group-hover:text-clay-600 transition-colors">
                      {t('farmer.qaYojana', 'Verify Statutory Entitlements')}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {t('farmer.qaYojanaDesc', 'Calculate statutory KCC limit, verify MSP rates, and reconcile PMFBY insurance.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-900/60 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
              </Link>

              <Link
                to="/farmer/grievances"
                style={{ animationDelay: '240ms' }}
                className={`p-4 sm:p-5 flex items-center justify-between hover:bg-paper-100 transition-colors group ${
                  prefersReducedMotion ? '' : 'animate-fade-up'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-serif font-bold text-lg text-clay-500 w-6">04</span>
                  <img src={grievanceSeal} alt="" className="w-6 h-6 object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-indigo-900 group-hover:text-clay-600 transition-colors">
                      {t('farmer.qaGrievance', 'File or Track a Grievance')}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {t('farmer.qaGrievanceDesc', 'Submit formal complaints regarding subsidy delays or land record errors.')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-900/60 group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Activity Timeline with scaleY vertical rule & spring dots (M3.1) */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold tracking-wider text-clay-500">
                {t('farmer.recentActivity', 'Verified Event Audit Timeline')}
              </span>
              <div className="h-px bg-paper-200 flex-1" aria-hidden="true" />
            </div>

            <div className="border border-indigo-900 rounded-sm bg-paper-50 p-5 sm:p-6 shadow-hard-sm">
              <div className="relative pl-6 space-y-6">
                {/* Vertical rule line scaling top-to-bottom (M3.1) */}
                <div
                  className={`absolute left-2.5 top-2 bottom-2 w-0.5 bg-paper-200 origin-top ${
                    prefersReducedMotion ? '' : 'transition-transform duration-600 ease-out-expo'
                  }`}
                  aria-hidden="true"
                />

                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative flex items-start gap-3">
                    {/* Timeline dot with spring pop after line */}
                    <span
                      style={{ animationDelay: `${prefersReducedMotion ? 0 : 400 + idx * 80}ms` }}
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${evt.dotColor} border-2 border-paper-50 ${
                        prefersReducedMotion ? '' : 'animate-scale-in'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">
                        {evt.text}
                      </p>
                      <span className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>{formatRelativeTime(evt.date, i18n.language)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              ICAR-CRIDA AGROMET ADVISORY & SOIL HEALTH CARD
              Fills overview screen with localized agro-climatic intelligence
              ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Agromet Advisory Bulletin */}
            <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-paper-200 pb-2">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-saffron-500 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 font-mono block">
                        भाकृअनुप - मौसम वेधशाला (ICAR-CRIDA)
                      </span>
                      <h4 className="font-serif font-bold text-base text-indigo-950">
                        वर्धा जिला साप्ताहिक कृषि मौसम बुलेटिन
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2 py-0.5 border border-sage-600 rounded-xs">
                    तापमान: 28°C / 16°C
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
                    <span className="font-bold text-indigo-950 block">कपास व सोयाबीन भंडारण सलाह:</span>
                    <p className="text-ink-muted leading-relaxed">
                      मौसम मुख्यतः शुष्क रहने का अनुमान है। कटी हुई फसल को नमी से बचाने हेतु तिरपाल से ढकें तथा मंडी विक्रय पूर्व दाने में नमी 10% से नीचे रखें।
                    </p>
                  </div>

                  <div className="p-2.5 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
                    <span className="font-bold text-indigo-950 block">चना / रबी दलहन सिंचाई:</span>
                    <p className="text-ink-muted leading-relaxed">
                      फसल में फूल आने की अवस्था में पहली हल्की सिंचाई स्प्रिंकलर विधि से करें। यूरिया का अनावश्यक छिड़काव न करें।
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[11px] font-semibold text-sage-800 flex items-center justify-between border-t border-paper-200">
                <span>अगले 5 दिनों में वर्षा की संभावना: 5% (साफ मौसम)</span>
                <span className="font-mono font-bold text-indigo-900">वर्धा वेधशाला</span>
              </div>
            </div>

            {/* Soil Health Card Recommendation */}
            <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-paper-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-sage-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 font-mono block">
                        मृदा स्वास्थ्य कार्ड (खसरा 102/1)
                      </span>
                      <h4 className="font-serif font-bold text-base text-indigo-950">
                        सत्यापित पोषक तत्व विश्लेषण व उर्वरक अनुशंसा
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-900 bg-paper-50 px-2 py-0.5 border border-indigo-900 rounded-xs">
                    सॉइल लैब वर्धा
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">जैविक कार्बन (OC)</span>
                    <span className="font-bold text-indigo-900 text-sm">0.58% (मध्यम)</span>
                  </div>
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">नाइट्रोजन (N)</span>
                    <span className="font-bold text-rust-600 text-sm">180 kg/ha (न्यून)</span>
                  </div>
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">फॉस्फोरस (P)</span>
                    <span className="font-bold text-sage-700 text-sm">24 kg/ha (पर्याप्त)</span>
                  </div>
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">पोटाश (K)</span>
                    <span className="font-bold text-sage-700 text-sm">290 kg/ha (उच्च)</span>
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted leading-tight">
                  अनुशंसा: नाइट्रोजन की कमी की पूर्ति हेतु 25 किग्रा यूरिया + 50 किग्रा नीम लेपित खाद प्रति एकड़ प्रयोग करें।
                </p>
              </div>

              <div className="mt-3 pt-2 text-[11px] font-semibold text-clay-700 flex items-center justify-between border-t border-paper-200">
                <span>सॉइल सैंपल टेस्ट क्रमांक: SHC-WRD-2026-4412</span>
                <span className="font-bold text-indigo-950">वैध: 2027 तक</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              VILLAGE AGRICULTURE DESK & DIRECT CONTACTS
              ========================================================================= */}
          <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-5 shadow-hard-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-paper-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-clay-600 shrink-0" />
                <h4 className="font-serif font-bold text-base text-indigo-950">
                  चंद्रपुर खुर्द ग्राम पंचायत कृषि सेवा डेस्क
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 bg-paper-100 px-3 py-1 border border-indigo-900 rounded-xs">
                <PhoneCall className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                <span>पंचायत भवन हेल्पडेस्क: 07152-284100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
                <span className="font-bold text-indigo-950 block">श्री प्रकाश जाधव</span>
                <span className="text-[11px] text-ink-muted block">कृषि सहायक (Krishi Sahayak)</span>
                <span className="text-[11px] font-mono text-clay-700 font-semibold block">मो. 98230-XXXXX</span>
                <span className="text-[10px] text-sage-800 font-semibold block">बीज व उर्वरक परमिट वितरण</span>
              </div>

              <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
                <span className="font-bold text-indigo-950 block">डॉ. नितिन खोड़े</span>
                <span className="text-[11px] text-ink-muted block">पशुधन विकास अधिकारी (LDO)</span>
                <span className="text-[11px] font-mono text-clay-700 font-semibold block">मो. 94218-XXXXX</span>
                <span className="text-[10px] text-sage-800 font-semibold block">दुधारू पशु टीकाकरण व KCC लोन</span>
              </div>

              <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
                <span className="font-bold text-indigo-950 block">राष्ट्रीय किसान कॉल सेंटर</span>
                <span className="text-[11px] text-ink-muted block">कृषि मंत्रालय (22 भाषाएं)</span>
                <span className="text-[11px] font-mono text-indigo-950 font-bold block">1800-180-1551 (टोल-फ्री)</span>
                <span className="text-[10px] text-sage-800 font-semibold block">24x7 निःशुल्क विशेषज्ञ परामर्श</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
