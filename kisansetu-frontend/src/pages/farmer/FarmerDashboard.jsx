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
          {/* M3.1: Haq Gap Hero Card */}
          <Panel accent="clay" className="shadow-hard space-y-4">
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
                  <MapPin className="w-5 h-5 text-indigo-900 group-hover:text-clay-500 shrink-0" />
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
                  <CreditCard className="w-5 h-5 text-indigo-900 group-hover:text-clay-500 shrink-0" />
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
                  <Gift className="w-5 h-5 text-indigo-900 group-hover:text-clay-500 shrink-0" />
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
                  <FileText className="w-5 h-5 text-indigo-900 group-hover:text-clay-500 shrink-0" />
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
        </>
      )}
    </div>
  );
}
