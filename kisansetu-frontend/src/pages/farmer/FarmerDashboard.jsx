import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  AlertCircle,
  Check,
  UserCheck,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import useDiscrepancies from '../../hooks/useDiscrepancies';
import farmerApi from '../../api/farmerApi';
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
import Modal from '../../components/common/Modal';
import Field from '../../components/common/Field';
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
  const isEn = i18n.language === 'en';
  const { farmerId } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle('farmer.dashboard', 'Farmer Overview');

  const fetchProfile = useCallback(() => farmerId ? getMe(farmerId) : Promise.resolve({ success: true, data: null }), [farmerId]);
  const fetchEntitlementsData = useCallback(() => farmerId ? getEntitlements(farmerId) : Promise.resolve({ success: true, data: [] }), [farmerId]);

  const {
    data: farmer,
    loading: farmerLoading,
    error: farmerError,
    retry: retryProfile,
  } = useAsync(fetchProfile, Boolean(farmerId), [farmerId]);

  const {
    data: entitlements,
    loading: entLoading,
    error: entError,
    retry: retryEntitlements,
  } = useAsync(fetchEntitlementsData, Boolean(farmerId), [farmerId]);

  const {
    openDiscrepancies,
    hasDiscrepancies,
    loading: discLoading,
  } = useDiscrepancies(farmerId);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  const [profileForm, setProfileForm] = useState({
    farmerName: '',
    fatherSpouseName: '',
    dob: '',
    gender: 'Male',
    alternateMobile: '',
    aadhaarNumber: '',
    category: 'General',
    address: '',
    village: '',
    tehsil: '',
    district: '',
    state: 'Chhattisgarh',
    pinCode: '',
    farmerType: 'Individual',
    farmingType: 'Owner',
    primaryCrop: 'Paddy',
    secondaryCrops: '',
    totalLandArea: '3.5',
    irrigationAvailable: true,
    irrigationType: 'Canal',
    soilType: 'Alluvial',
    documentsJson: '',
  });

  const [docChecklist, setDocChecklist] = useState({
    aadhaar: true,
    khasra: true,
    passbook: true,
    cropCert: false,
  });

  useEffect(() => {
    if (farmer) {
      setProfileForm({
        farmerName: farmer.name || farmer.farmerName || '',
        fatherSpouseName: farmer.fatherSpouseName || farmer.fatherName || '',
        dob: farmer.dob || '',
        gender: farmer.gender || 'Male',
        alternateMobile: farmer.alternateMobile || '',
        aadhaarNumber: farmer.aadhaarNumber || '',
        category: farmer.category || 'General',
        address: farmer.address || '',
        village: farmer.village || '',
        tehsil: farmer.tehsil || '',
        district: farmer.district || '',
        state: farmer.state || 'Chhattisgarh',
        pinCode: farmer.pinCode || '',
        farmerType: farmer.farmerType || 'Individual',
        farmingType: farmer.farmingType || 'Owner',
        primaryCrop: farmer.primaryCrop || 'Paddy',
        secondaryCrops: farmer.secondaryCrops || '',
        totalLandArea: String(farmer.totalLandArea || '3.5'),
        irrigationAvailable: Boolean(farmer.irrigationAvailable),
        irrigationType: farmer.irrigationType || 'Canal',
        soilType: farmer.soilType || 'Alluvial',
        documentsJson: farmer.documentsJson || '',
      });

      if (farmer.documentsJson) {
        try {
          const parsed = typeof farmer.documentsJson === 'string' ? JSON.parse(farmer.documentsJson) : farmer.documentsJson;
          if (parsed && typeof parsed === 'object') {
            setDocChecklist((prev) => ({ ...prev, ...parsed }));
          }
        } catch {}
      }
    }
  }, [farmer]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!farmerId) return;
    setIsSavingProfile(true);
    setProfileMsg({ text: '', type: '' });
    try {
      const payload = {
        ...profileForm,
        mobileNumber: farmer?.mobileNumber || farmer?.mobile || farmer?.phone || '',
        totalLandArea: Number(profileForm.totalLandArea) || 0,
        documentsJson: JSON.stringify(docChecklist),
      };
      const res = await farmerApi.updateProfile(farmerId, payload);
      if (res?.success) {
        setProfileMsg({ text: isEn ? 'Farmer profile successfully updated in registry!' : 'किसान प्रोफ़ाइल सफलतापूर्वक अद्यतन की गई!', type: 'success' });
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setProfileMsg({ text: '', type: '' });
          retryProfile();
        }, 1200);
      }
    } catch (err) {
      setProfileMsg({ text: err?.response?.data?.message || err?.message || 'Error updating profile', type: 'error' });
    } finally {
      setIsSavingProfile(false);
    }
  };

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
  }, [t, i18n.language]);

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
        title={farmer?.name || (isEn ? 'Farmer Dashboard' : 'किसान डैशबोर्ड')}
        subtitle={farmer?.village ? `${farmer.village}, ${farmer.district}` : (isEn ? 'Digital Land & Entitlement Registry' : 'डिजिटल भूमि एवं हक खाता')}
        actions={
          farmer?.id ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-900 bg-paper-100 border border-paper-200 px-2.5 py-1.5 rounded-sm">
                {farmer.id}
              </span>
              <Stamp status={farmer?.status || 'ACTIVE'} size="md" />
              <Button
                variant="secondary"
                size="sm"
                icon={<UserCheck className="w-4 h-4" />}
                onClick={() => setIsProfileModalOpen(true)}
              >
                {isEn ? 'Edit Profile' : 'विवरण सुधारें'}
              </Button>
            </div>
          ) : null
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
                        {isEn ? 'ICAR - Weather Observatory (CRIDA)' : 'भाकृअनुप - मौसम वेधशाला (ICAR-CRIDA)'}
                      </span>
                      <h4 className="font-serif font-bold text-base text-indigo-950">
                        {isEn ? 'Wardha District Weekly Agro-Meteorological Bulletin' : 'वर्धा जिला साप्ताहिक कृषि मौसम बुलेटिन'}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2 py-0.5 border border-sage-600 rounded-xs">
                    {isEn ? 'Temp: 28°C / 16°C' : 'तापमान: 28°C / 16°C'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
                    <span className="font-bold text-indigo-950 block">
                      {isEn ? 'Cotton & Soybean Storage Advisory:' : 'कपास व सोयाबीन भंडारण सलाह:'}
                    </span>
                    <p className="text-ink-muted leading-relaxed">
                      {isEn
                        ? 'Weather is forecast to remain largely dry. Cover harvested produce with tarpaulins to avoid moisture, and ensure grain moisture is kept below 10% prior to APMC sale.'
                        : 'मौसम मुख्यतः शुष्क रहने का अनुमान है। कटी हुई फसल को नमी से बचाने हेतु तिरपाल से ढकें तथा मंडी विक्रय पूर्व दाने में नमी 10% से नीचे रखें।'
                      }
                    </p>
                  </div>

                  <div className="p-2.5 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
                    <span className="font-bold text-indigo-950 block">
                      {isEn ? 'Gram / Rabi Pulses Irrigation:' : 'चना / रबी दलहन सिंचाई:'}
                    </span>
                    <p className="text-ink-muted leading-relaxed">
                      {isEn
                        ? 'Apply first light sprinkler irrigation at the pod initiation stage. Avoid redundant urea applications.'
                        : 'फसल में फूल आने की अवस्था में पहली हल्की सिंचाई स्प्रिंकलर विधि से करें। यूरिया का अनावश्यक छिड़काव न करें।'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[11px] font-semibold text-sage-800 flex items-center justify-between border-t border-paper-200">
                <span>
                  {isEn ? 'Rain probability over next 5 days: 5% (Clear Weather)' : 'अगले 5 दिनों में वर्षा की संभावना: 5% (साफ मौसम)'}
                </span>
                <span className="font-mono font-bold text-indigo-900">
                  {isEn ? 'Wardha Station' : 'वर्धा वेधशाला'}
                </span>
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
                        {isEn ? 'Soil Health Card (Khasra 102/1)' : 'मृदा स्वास्थ्य कार्ड (खसरा 102/1)'}
                      </span>
                      <h4 className="font-serif font-bold text-base text-indigo-950">
                        {isEn ? 'Nutrient Analysis & Fertilizer Prescription' : 'सत्यापित पोषक तत्व विश्लेषण व उर्वरक अनुशंसा'}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-900 bg-paper-50 px-2 py-0.5 border border-indigo-900 rounded-xs">
                    {isEn ? 'Soil Lab Wardha' : 'सॉइल लैब वर्धा'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">
                      {isEn ? 'Organic Carbon (OC)' : 'जैविक कार्बन (OC)'}
                    </span>
                    <span className="font-bold text-indigo-900 text-sm">
                      {isEn ? '0.58% (Medium)' : '0.58% (मध्यम)'}
                    </span>
                  </div>
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">
                      {isEn ? 'Nitrogen (N)' : 'नाइट्रोजन (N)'}
                    </span>
                    <span className="font-bold text-rust-600 text-sm">
                      {isEn ? '180 kg/ha (Deficit)' : '180 kg/ha (न्यून)'}
                    </span>
                  </div>
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">
                      {isEn ? 'Phosphorus (P)' : 'फॉस्फोरस (P)'}
                    </span>
                    <span className="font-bold text-sage-700 text-sm">
                      {isEn ? '24 kg/ha (Optimum)' : '24 kg/ha (पर्याप्त)'}
                    </span>
                  </div>
                  <div className="p-2 bg-paper-50 rounded-xs border border-paper-200">
                    <span className="text-ink-muted block text-[10px] uppercase font-bold">
                      {isEn ? 'Potash (K)' : 'पोटाश (K)'}
                    </span>
                    <span className="font-bold text-sage-700 text-sm">
                      {isEn ? '290 kg/ha (High)' : '290 kg/ha (उच्च)'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-ink-muted leading-tight">
                  {isEn
                    ? 'Recommendation: Apply 25 kg Urea + 50 kg Neem-Coated Compost per acre to offset Nitrogen deficit.'
                    : 'अनुशंसा: नाइट्रोजन की कमी की पूर्ति हेतु 25 किग्रा यूरिया + 50 किग्रा नीम लेपित खाद प्रति एकड़ प्रयोग करें।'
                  }
                </p>
              </div>

              <div className="mt-3 pt-2 text-[11px] font-semibold text-clay-700 flex items-center justify-between border-t border-paper-200">
                <span>
                  {isEn ? 'Sample Test No: SHC-WRD-2026-4412' : 'सॉइल सैंपल टेस्ट क्रमांक: SHC-WRD-2026-4412'}
                </span>
                <span className="font-bold text-indigo-950">
                  {isEn ? 'Valid: Until 2027' : 'वैध: 2027 तक'}
                </span>
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
                  {isEn ? 'Chandrapur Khurd Gram Panchayat Agriculture Helpdesk' : 'चंद्रपुर खुर्द ग्राम पंचायत कृषि सेवा डेस्क'}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 bg-paper-100 px-3 py-1 border border-indigo-900 rounded-xs">
                <PhoneCall className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                <span>
                  {isEn ? 'Panchayat Helpdesk: 07152-284100' : 'पंचायत भवन हेल्पडेस्क: 07152-284100'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
                <span className="font-bold text-indigo-950 block">
                  {isEn ? 'Shri Prakash Jadhav' : 'श्री प्रकाश जाधव'}
                </span>
                <span className="text-[11px] text-ink-muted block">
                  {isEn ? 'Krishi Sahayak (Agri Officer)' : 'कृषि सहायक (Krishi Sahayak)'}
                </span>
                <span className="text-[11px] font-mono text-clay-700 font-semibold block">मो. 98230-XXXXX</span>
                <span className="text-[10px] text-sage-800 font-semibold block">
                  {isEn ? 'Seed & Fertilizer Permit Issuance' : 'बीज व उर्वरक परमिट वितरण'}
                </span>
              </div>

              <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
                <span className="font-bold text-indigo-950 block">
                  {isEn ? 'Dr. Nitin Khode' : 'डॉ. नितिन खोड़े'}
                </span>
                <span className="text-[11px] text-ink-muted block">
                  {isEn ? 'Livestock Officer (LDO)' : 'पशुधन विकास अधिकारी (LDO)'}
                </span>
                <span className="text-[11px] font-mono text-clay-700 font-semibold block">मो. 94218-XXXXX</span>
                <span className="text-[10px] text-sage-800 font-semibold block">
                  {isEn ? 'Dairy Cattle Health & KCC Loans' : 'दुधारू पशु टीकाकरण व KCC लोन'}
                </span>
              </div>

              <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
                <span className="font-bold text-indigo-950 block">
                  {isEn ? 'National Kisan Call Centre' : 'राष्ट्रीय किसान कॉल सेंटर'}
                </span>
                <span className="text-[11px] text-ink-muted block">
                  {isEn ? 'Ministry of Agriculture (22 Languages)' : 'कृषि मंत्रालय (22 भाषाएं)'}
                </span>
                <span className="text-[11px] font-mono text-indigo-950 font-bold block">1800-180-1551 (Toll-Free)</span>
                <span className="text-[10px] text-sage-800 font-semibold block">
                  {isEn ? '24x7 Free Expert Consultancy' : '24x7 निःशुल्क विशेषज्ञ परामर्श'}
                </span>
              </div>
            </div>
          </div>

          {/* Farmer Profile Comprehensive Update Modal */}
          <Modal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            title={isEn ? 'Update Farmer Profile & Agricultural Demographics' : 'किसान प्रोफ़ाइल एवं कृषि जनसांख्यिकी अद्यतन'}
            maxWidth="max-w-3xl"
          >
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="p-3 bg-paper-100 border border-paper-200 rounded-sm text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? 'Keep your personal and agricultural details accurate to ensure seamless verification for KCC loans, MSP procurement, and PMFBY claims.'
                  : 'केसीसी ऋण, न्यूनतम समर्थन मूल्य (MSP) और फसल बीमा दावों में सुगम सत्यापन हेतु अपने व्यक्तिगत व कृषि विवरण अद्यतन रखें।'}
              </div>

              {profileMsg.text && (
                <div className={`p-3 rounded-sm text-xs font-bold flex items-center gap-2 animate-slide-down ${profileMsg.type === 'error' ? 'bg-rust-100 text-rust-700 border border-rust-600' : 'bg-sage-100 text-sage-800 border border-sage-600'}`}>
                  {profileMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="border-b border-paper-200 pb-2">
                <span className="text-xs font-bold font-serif text-indigo-950 uppercase tracking-wider">
                  {isEn ? '1. Personal Information' : '१. व्यक्तिगत विवरण'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  id="fp-name"
                  label={isEn ? 'Full Name' : 'पूरा नाम'}
                  value={profileForm.farmerName}
                  onChange={(e) => setProfileForm({ ...profileForm, farmerName: e.target.value })}
                  required
                />
                <Field
                  id="fp-father"
                  label={isEn ? "Father's / Spouse's Name" : 'पिता / पति का नाम'}
                  value={profileForm.fatherSpouseName}
                  onChange={(e) => setProfileForm({ ...profileForm, fatherSpouseName: e.target.value })}
                  placeholder="e.g. Ramprasad"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field
                  id="fp-dob"
                  type="date"
                  label={isEn ? 'Date of Birth' : 'जन्म तिथि'}
                  value={profileForm.dob}
                  onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                />
                <Field
                  id="fp-gender"
                  type="select"
                  label={isEn ? 'Gender' : 'लिंग'}
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  options={[
                    { value: 'Male', label: isEn ? 'Male (पुरुष)' : 'पुरुष' },
                    { value: 'Female', label: isEn ? 'Female (महिला)' : 'महिला' },
                    { value: 'Other', label: isEn ? 'Other (अन्य)' : 'अन्य' },
                  ]}
                />
                <Field
                  id="fp-cat"
                  type="select"
                  label={isEn ? 'Social Category' : 'सामाजिक श्रेणी'}
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  options={[
                    { value: 'General', label: 'General (सामान्य)' },
                    { value: 'OBC', label: 'OBC (अन्य पिछड़ा वर्ग)' },
                    { value: 'SC', label: 'SC (अनुसूचित जाति)' },
                    { value: 'ST', label: 'ST (अनुसूचित जनजाति)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  id="fp-alt-mob"
                  label={isEn ? 'Alternate Mobile' : 'वैकल्पिक मोबाइल'}
                  value={profileForm.alternateMobile}
                  onChange={(e) => setProfileForm({ ...profileForm, alternateMobile: e.target.value })}
                  placeholder="98230XXXXX"
                />
                <Field
                  id="fp-aadhaar"
                  label={isEn ? 'Aadhaar (Masked)' : 'आधार क्रमांक (सुरक्षित)'}
                  value={profileForm.aadhaarNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, aadhaarNumber: e.target.value })}
                  placeholder="XXXX-XXXX-1234"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Field
                  id="fp-village"
                  label={isEn ? 'Village' : 'ग्राम'}
                  value={profileForm.village}
                  onChange={(e) => setProfileForm({ ...profileForm, village: e.target.value })}
                  placeholder="Arang"
                />
                <Field
                  id="fp-tehsil"
                  label={isEn ? 'Tehsil / Block' : 'तहसील / विकासखंड'}
                  value={profileForm.tehsil}
                  onChange={(e) => setProfileForm({ ...profileForm, tehsil: e.target.value })}
                  placeholder="Arang"
                />
                <Field
                  id="fp-district"
                  label={isEn ? 'District' : 'जिला'}
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  placeholder="Raipur"
                />
                <Field
                  id="fp-state"
                  label={isEn ? 'State' : 'राज्य'}
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  placeholder="Chhattisgarh"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Field
                    id="fp-address"
                    label={isEn ? 'Full Street / Postal Address' : 'पूरा पता / मोहल्ला'}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Ward No. 4, Main Road, Arang"
                  />
                </div>
                <Field
                  id="fp-pincode"
                  label={isEn ? 'PIN Code' : 'पिन कोड'}
                  value={profileForm.pinCode}
                  onChange={(e) => setProfileForm({ ...profileForm, pinCode: e.target.value })}
                  placeholder="493441"
                />
              </div>

              {/* Agricultural Demographics */}
              <div className="border-b border-paper-200 pb-2 pt-2">
                <span className="text-xs font-bold font-serif text-indigo-950 uppercase tracking-wider">
                  {isEn ? '2. Agricultural Land & Farming Profile' : '२. कृषि भूमि एवं खेती विवरण'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field
                  id="fp-farmer-type"
                  type="select"
                  label={isEn ? 'Farmer Scale' : 'कृषक श्रेणी'}
                  value={profileForm.farmerType}
                  onChange={(e) => setProfileForm({ ...profileForm, farmerType: e.target.value })}
                  options={[
                    { value: 'Marginal', label: isEn ? 'Marginal (< 1 ha)' : 'सीमांत कृषक (< 1 हे.)' },
                    { value: 'Small', label: isEn ? 'Small (1 - 2 ha)' : 'लघु कृषक (1 - 2 हे.)' },
                    { value: 'Medium', label: isEn ? 'Medium / Large' : 'मध्यम / बड़े कृषक' },
                    { value: 'Individual', label: 'Individual Farmer' },
                  ]}
                />
                <Field
                  id="fp-farming-type"
                  type="select"
                  label={isEn ? 'Tenure Status' : 'काश्तकारी प्रकार'}
                  value={profileForm.farmingType}
                  onChange={(e) => setProfileForm({ ...profileForm, farmingType: e.target.value })}
                  options={[
                    { value: 'Owner', label: isEn ? 'Land Owner (भू-स्वामी)' : 'स्वयं काश्त (भू-स्वामी)' },
                    { value: 'Tenant', label: isEn ? 'Tenant (बटाईदार)' : 'बटाईदार / पट्टेदार' },
                    { value: 'Sharecropper', label: isEn ? 'Sharecropper' : 'हिस्सेदार' },
                  ]}
                />
                <Field
                  id="fp-total-land"
                  type="number"
                  step="0.01"
                  label={isEn ? 'Total Land (Acres)' : 'कुल कृषि रकबा (एकड़)'}
                  value={profileForm.totalLandArea}
                  onChange={(e) => setProfileForm({ ...profileForm, totalLandArea: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  id="fp-crop"
                  label={isEn ? 'Primary Crop' : 'मुख्य फसल'}
                  value={profileForm.primaryCrop}
                  onChange={(e) => setProfileForm({ ...profileForm, primaryCrop: e.target.value })}
                  placeholder="Paddy"
                />
                <Field
                  id="fp-sec-crop"
                  label={isEn ? 'Secondary Crops' : 'द्वितीयक फसलें'}
                  value={profileForm.secondaryCrops}
                  onChange={(e) => setProfileForm({ ...profileForm, secondaryCrops: e.target.value })}
                  placeholder="Wheat, Gram, Mustard"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field
                  id="fp-irrig-avail"
                  type="select"
                  label={isEn ? 'Irrigation Facility' : 'सिंचाई उपलब्धता'}
                  value={profileForm.irrigationAvailable ? 'true' : 'false'}
                  onChange={(e) => setProfileForm({ ...profileForm, irrigationAvailable: e.target.value === 'true' })}
                  options={[
                    { value: 'true', label: isEn ? 'Irrigated (सिंचित)' : 'सिंचित भूमि' },
                    { value: 'false', label: isEn ? 'Rainfed / Unirrigated' : 'असिंचित (वर्षा आधारित)' },
                  ]}
                />
                <Field
                  id="fp-irrigation-type"
                  type="select"
                  label={isEn ? 'Irrigation System' : 'सिंचाई व्यवस्था'}
                  value={profileForm.irrigationType}
                  onChange={(e) => setProfileForm({ ...profileForm, irrigationType: e.target.value })}
                  options={[
                    { value: 'Canal', label: isEn ? 'Canal / River' : 'नहर / नदी' },
                    { value: 'Tube Well', label: isEn ? 'Tube Well / Bore' : 'नलकूप / बोर' },
                    { value: 'Rainfed', label: isEn ? 'Rainfed (वर्षा आधारित)' : 'वर्षा आधारित' },
                    { value: 'Drip', label: isEn ? 'Drip / Micro-Irrigation' : 'ड्रिप / सूक्ष्म सिंचाई' },
                  ]}
                />
                <Field
                  id="fp-soil"
                  type="select"
                  label={isEn ? 'Soil Type' : 'मृदा का प्रकार'}
                  value={profileForm.soilType}
                  onChange={(e) => setProfileForm({ ...profileForm, soilType: e.target.value })}
                  options={[
                    { value: 'Alluvial', label: isEn ? 'Alluvial (जलोढ़)' : 'जलोढ़ मिट्टी' },
                    { value: 'Black (Regur)', label: isEn ? 'Black Cotton (काली)' : 'काली मिट्टी' },
                    { value: 'Red & Yellow', label: isEn ? 'Red & Yellow (लाल-पीली)' : 'लाल-पीली मिट्टी' },
                    { value: 'Clay Loam', label: isEn ? 'Clay Loam (दोमट)' : 'दोमट मिट्टी' },
                  ]}
                />
              </div>

              {/* Supporting Documents Checklist */}
              <div className="border-b border-paper-200 pb-2 pt-2">
                <span className="text-xs font-bold font-serif text-indigo-950 uppercase tracking-wider">
                  {isEn ? '3. Verification Documents Checklist' : '३. सहायक दस्तावेज सत्यापन स्थिति'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-paper-100 p-3 rounded-sm border border-paper-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docChecklist.aadhaar}
                    onChange={(e) => setDocChecklist({ ...docChecklist, aadhaar: e.target.checked })}
                    className="accent-indigo-900 w-4 h-4 rounded"
                  />
                  <span>{isEn ? 'Aadhaar Card Copy (आधार कार्ड)' : 'आधार कार्ड प्रतिलिपि'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docChecklist.khasra}
                    onChange={(e) => setDocChecklist({ ...docChecklist, khasra: e.target.checked })}
                    className="accent-indigo-900 w-4 h-4 rounded"
                  />
                  <span>{isEn ? 'B-1 / Khasra Document (खसरा बी-1)' : 'खसरा बी-1 भू-अभिलेख'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docChecklist.passbook}
                    onChange={(e) => setDocChecklist({ ...docChecklist, passbook: e.target.checked })}
                    className="accent-indigo-900 w-4 h-4 rounded"
                  />
                  <span>{isEn ? 'Bank Passbook / Cancelled Cheque' : 'बैंक पासबुक / चेक प्रति'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docChecklist.cropCert}
                    onChange={(e) => setDocChecklist({ ...docChecklist, cropCert: e.target.checked })}
                    className="accent-indigo-900 w-4 h-4 rounded"
                  />
                  <span>{isEn ? 'Crop Sowing Report (गिरदावरी रिपोर्ट)' : 'फसल गिरदावरी रिपोर्ट'}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-paper-200">
                <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                  {isEn ? 'Cancel' : 'रद्द करें'}
                </Button>
                <Button type="submit" variant="primary" disabled={isSavingProfile}>
                  {isSavingProfile ? (isEn ? 'Updating...' : 'अद्यतन किया जा रहा है...') : (isEn ? 'Save Profile Details' : 'विवरण सुरक्षित करें')}
                </Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
