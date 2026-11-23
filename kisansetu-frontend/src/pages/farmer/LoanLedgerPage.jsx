import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import { getFarmerLoans } from '../../services/farmerService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Tabs from '../../components/common/Tabs';
import Stamp from '../../components/common/Stamp';
import TermHint from '../../components/common/TermHint';
import ErrorState from '../../components/common/ErrorState';
import CountUp from '../../components/motion/CountUp';

/**
 * Farmer Loan Ledger Page displaying institutional credit accounts, NPA status, and limits.
 */
export default function LoanLedgerPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { farmerId } = useAuth();
  useDocumentTitle('loans.title', 'Farmer Credit Ledger');

  const [activeTab, setActiveTab] = useState('ALL');

  const fetchLoans = useCallback(() => getFarmerLoans(farmerId || 'FRM-0003'), [farmerId]);
  const { data: loansData, loading, error, retry } = useAsync(fetchLoans, true, [farmerId]);

  const list = Array.isArray(loansData) ? loansData : [];

  const totalSanctioned = list.reduce((sum, item) => sum + (Number(item.sanctionedAmount) || 0), 0);
  const totalOutstanding = list.reduce((sum, item) => sum + (Number(item.outstandingAmount) || 0), 0);
  const npaList = list.filter((item) => item.loanStatus === 'NPA');
  const activeList = list.filter((item) => item.loanStatus === 'ACTIVE');
  const closedList = list.filter((item) => item.loanStatus === 'CLOSED');

  const filteredLoans = list.filter((l) => {
    if (activeTab === 'ALL') return true;
    return l.loanStatus === activeTab;
  });

  const tabs = [
    { id: 'ALL', label: t('loans.tabAll', 'All Accounts'), count: list.length },
    { id: 'ACTIVE', label: t('loans.tabActive', 'Active'), count: activeList.length },
    { id: 'CLOSED', label: t('loans.tabClosed', 'Closed'), count: closedList.length },
    { id: 'NPA', label: t('loans.tabNpa', 'NPA (Overdue)'), count: npaList.length },
  ];

  const columns = useMemo(
    () => [
      {
        key: 'bankName',
        header: isEn ? 'Lender Bank' : 'ऋणदाता बैंक',
        render: (loan) => (
          <div>
            <div className="font-bold text-indigo-900">
              {isEn
                ? (loan.bankName || 'Bank of Maharashtra (Wardha Branch)')
                : (loan.bankNameHi || (loan.bankName?.includes('Maharashtra') ? 'बैंक ऑफ महाराष्ट्र (वर्धा शाखा)' : 'वर्धा जिला मध्यवर्ती सहकारी बैंक'))}
            </div>
            <div className="text-xs text-ink-muted">
              {isEn
                ? (loan.loanType || 'KCC Crop Loan')
                : (loan.loanTypeHi || (loan.loanType?.includes('Crop') ? 'केसीसी फसली ऋण' : 'ड्रिप सिंचाई मियादी ऋण'))}
            </div>
          </div>
        ),
      },
      {
        key: 'sanctionedAmount',
        header: t('loans.sanctioned', 'Sanctioned Limit'),
        render: (loan) => (
          <span className="tabular-nums font-semibold text-indigo-900">
            {formatCurrency(loan.sanctionedAmount, i18n.language)}
          </span>
        ),
      },
      {
        key: 'outstandingAmount',
        header: t('loans.outstanding', 'Outstanding Balance'),
        render: (loan) => {
          const ratio = Math.min(
            100,
            Math.round((Number(loan.outstandingAmount) / Number(loan.sanctionedAmount || 1)) * 100)
          );
          const isNpa = loan.loanStatus === 'NPA';

          return (
            <div className="space-y-1 max-w-xs">
              <div className={`tabular-nums font-bold ${isNpa ? 'text-rust-600' : 'text-indigo-900'}`}>
                {formatCurrency(loan.outstandingAmount, i18n.language)}
              </div>
              <div className="w-24 sm:w-32 bg-paper-200 h-1.5 rounded-full overflow-hidden" aria-hidden="true">
                <div
                  className={`h-full rounded-full ${isNpa ? 'bg-rust-600' : 'bg-clay-500'}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        key: 'loanStatus',
        header: (
          <span className="inline-flex items-center gap-1">
            <span>{t('loans.status', 'Loan Status')}</span>
            <TermHint term="NPA" />
          </span>
        ),
        render: (loan) => <Stamp status={loan.loanStatus} />,
      },
      {
        key: 'disbursedOn',
        header: t('loans.disbursed', 'Disbursement Date'),
        render: (loan) => (
          <span className="text-xs text-ink-muted tabular-nums">
            {formatDate(loan.disbursedOn, i18n.language)}
          </span>
        ),
      },
    ],
    [t, i18n.language]
  );

  if (error) {
    return (
      <ErrorState
        title={t('errors.loadFailed', 'Unable to load credit ledger')}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={isEn ? 'Institutional Credit Accounts' : 'संस्थागत ऋण एवं साख बही'}
        title={isEn ? 'Farmer Credit Ledger' : 'किसान ऋण बही'}
        subtitle={isEn ? 'Live tracking of sanctioned limits, outstanding balances, and repayment standing.' : 'स्वीकृत सीमा, वर्तमान बकाया राशि और अदायगी स्थिति का प्रत्यक्ष विवरण।'}
      />

      {/* Summary KPI Cards with CountUp (M3.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={isEn ? 'Total Sanctioned' : 'कुल स्वीकृत ऋण'}
          value={
            <CountUp
              value={totalSanctioned}
              format={(val) => formatCurrency(val, i18n.language)}
            />
          }
          helperText={isEn ? 'Across all linked bank accounts' : 'सभी संबद्ध बैंक खातों में'}
          accent="indigo"
          loading={loading}
        />

        <StatCard
          label={isEn ? 'Total Outstanding' : 'कुल वर्तमान बकाया'}
          value={
            <CountUp
              value={totalOutstanding}
              format={(val) => formatCurrency(val, i18n.language)}
            />
          }
          helperText={isEn ? 'Current balance due' : 'वर्तमान देय राशि'}
          accent="clay"
          loading={loading}
        />

        <StatCard
          label={isEn ? 'Overdue / NPA Accounts' : 'एनपीए (अतिदेय) खाते'}
          value={<CountUp value={npaList.length} />}
          helperText={isEn ? 'Accounts requiring regularisation' : 'नियमितीकरण आवश्यक खाते'}
          accent={npaList.length > 0 ? 'rust' : 'sage'}
          loading={loading}
        />
      </div>

      {/* NPA Alert Banner with single pulse ring (M3.3) */}
      {npaList.length > 0 ? (
        <div className="bg-rust-100/60 border-l-4 border-l-rust-600 border-y border-r border-indigo-900 rounded-sm p-4 sm:p-5 shadow-hard-sm space-y-2 animate-pulse-once">
          <div className="flex items-center gap-3 text-rust-600">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base text-rust-600">
              {isEn ? 'NPA Notice: Immediate Regularisation Required' : 'एनपीए नोटिस: तत्काल नियमितीकरण आवश्यक'}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-8">
            {isEn
              ? 'One or more of your loan accounts has unpaid dues over 90 days. This restricts fresh KCC scale enhancement and interest subvention subsidies. Please visit your bank branch to request a restructuring or one-time settlement plan.'
              : 'आपके एक या अधिक ऋण खातों में 90 दिनों से अधिक की बकाया राशि है। इससे नई केसीसी ऋण सीमा वृद्धि और ब्याज अनुदान रुक सकता है। कृपया पुनर्गठन या एकमुश्त समाधान (OTS) के लिए अपनी बैंक शाखा में संपर्क करें।'}
          </p>
        </div>
      ) : null}

      {/* Accessible Navigation Tabs with sliding indicator (M1.3, M3.3) */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Cross-fade on Tab Change & NPA pulse border (M3.3) */}
      <div key={activeTab} className="animate-fade-in [animation-duration:200ms]">
        <DataTable
          columns={columns}
          data={filteredLoans}
          loading={loading}
          getRowClassName={(row) =>
            row.loanStatus === 'NPA' ? 'border-l-4 border-l-rust-600 animate-pulse-once' : ''
          }
          emptyTitle={t('loans.emptyTitle', 'No loan accounts in this category')}
          emptyDescription={t('loans.emptyDesc', 'No records match the selected tab filter.')}
        />
      </div>

      {/* =========================================================================
          GOVERNMENT SUBSIDIES & 4% INTEREST SUBVENTION POLICIES
          Fills vertical empty space with official credit rights, relief schemes & DLTC scales
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3">
        {/* Card 1: 4% Subvention Policy */}
        <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-clay-100 text-clay-700 border border-clay-600 rounded-xs">
                {isEn ? 'Govt. of India Scheme' : 'भारत सरकार योजना'}
              </span>
              <span className="text-xs font-bold font-serif text-indigo-900">
                {isEn ? '4% Net Interest' : '4% शुद्ध ब्याज'}
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-indigo-950">
              {isEn ? 'Interest Subvention Scheme (PRI)' : 'ब्याज अनुदान योजना (PRI Subvention)'}
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn
                ? 'On KCC loans up to ₹3,00,000, central government grants a 3% prompt repayment rebate against standard 7% interest.'
                : '₹3,00,000 तक के KCC ऋण पर 7% मानक ब्याज में से 3% केंद्र सरकार द्वारा त्वरित अदायगी छूट (Prompt Repayment) मिलती है।'
              }
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-paper-200 text-xs font-bold text-sage-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            <span>{isEn ? 'Applicable on timely repayment' : 'समय पर भुगतान करने पर लागू'}</span>
          </div>
        </div>

        {/* Card 2: One-Time Settlement (OTS) & Restructuring Helpdesk */}
        <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-rust-100 text-rust-700 border border-rust-600 rounded-xs">
                {isEn ? 'Relief & Remedy' : 'राहत एवं समाधान'}
              </span>
              <span className="text-xs font-bold font-serif text-indigo-900">
                {isEn ? 'NPA Restructuring' : 'NPA पुनर्गठन'}
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-indigo-950">
              {isEn ? 'One-Time Settlement (OTS) & Relief' : 'एकमुश्त समझौता (OTS) व राहत योजना'}
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn
                ? 'Legal entitlement to restructure crop loans into a 3 to 5 year term loan during natural calamity or acute distress.'
                : 'फसल नुकसान या प्राकृतिक आपदा की स्थिति में ऋण को 3 से 5 वर्ष के सावधि ऋण में परिवर्तित (Restructure) कराने का कानूनी अधिकार।'
              }
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-paper-200 text-xs font-bold text-clay-700 flex items-center justify-between">
            <Link to="/farmer/grievances?category=SUBSIDY_DELAY&ref=NPA_REGULARISATION" className="hover:underline flex items-center gap-1">
              <span>{isEn ? 'File Restructuring Request' : 'पुनर्गठन आवेदन दर्ज करें'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Wardha DLTC Scale of Finance Table */}
        <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-sage-100 text-sage-700 border border-sage-600 rounded-xs">
                {isEn ? 'DLTC Benchmark' : 'DLTC पैमाना'}
              </span>
              <span className="text-xs font-bold font-serif text-indigo-900">
                {isEn ? '2026-27 Rate' : '2026-27 दर'}
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-indigo-950">
              {isEn ? 'Crop-wise Scale of Finance' : 'फसलवार वित्त पैमाना (Scale of Finance)'}
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-paper-200">
                <span className="text-ink-muted">{isEn ? 'Soybean (Irrigated):' : 'सोयाबीन (सिंचित):'}</span>
                <span className="font-bold text-indigo-900 font-mono">
                  {isEn ? '₹54,000 / ha' : '₹54,000 / हेक्टेयर'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-paper-200">
                <span className="text-ink-muted">{isEn ? 'Cotton (BT Cotton):' : 'कपास (BT Cotton):'}</span>
                <span className="font-bold text-indigo-900 font-mono">
                  {isEn ? '₹68,000 / ha' : '₹68,000 / हेक्टेयर'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-muted">{isEn ? 'Gram / Rabi Pulses:' : 'चना / रबी दलहन:'}</span>
                <span className="font-bold text-indigo-900 font-mono">
                  {isEn ? '₹38,000 / ha' : '₹38,000 / हेक्टेयर'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-paper-200 text-xs font-bold text-indigo-900 flex items-center justify-between">
            <Link to="/farmer/entitlements" className="hover:underline flex items-center gap-1">
              <span>{isEn ? 'View Scale Details' : 'वित्त पैमाना विवरण'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL LEAD BANK & RURAL CREDIT DIRECTORY
          ========================================================================= */}
      <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-5 sm:p-6 shadow-hard-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-paper-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 block font-mono">
              {isEn ? 'Institutional Credit & Ombudsman Center' : 'संस्थागत ऋण एवं बैंकिंग लोकपाल केंद्र'}
            </span>
            <h3 className="font-serif font-bold text-lg text-indigo-950">
              {isEn ? 'Linked Bank Branches & Farmer Helpdesk (Wardha District)' : 'संबद्ध बैंक शाखाएं एवं किसान सहायता डेस्क (वर्धा जिला)'}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-sage-800 bg-sage-50 px-3 py-1.5 border border-sage-600 rounded-xs">
            <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <span>{isEn ? 'RBI Ombudsman Helpline: 14448 (Toll-Free)' : 'RBI लोकपाल हेल्पलाइन: 14448 (टोल-फ्री)'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-paper-100 rounded-sm border border-paper-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">
                {isEn ? 'Bank of Maharashtra (Main Branch, Wardha)' : 'बैंक ऑफ महाराष्ट्र (मुख्य शाखा, वर्धा)'}
              </span>
              <span className="text-xs font-mono font-bold text-clay-600">IFSC: MAHB0000123</span>
            </div>
            <p className="text-xs text-ink-muted">
              {isEn
                ? 'Nodal KCC Officer: Mr. Arvind Kulkarni • Phone: 07152-245123 • Branch Code: 0123'
                : 'नोडल KCC अधिकारी: श्री अरविंद कुलकर्णी • दूरभाष: 07152-245123 • शाखा कोड: 0123'}
            </p>
            <div className="text-[11px] text-sage-700 font-semibold">
              {isEn ? '✓ Aadhaar Seeding & DBT Auto-Credit Active' : '✓ आधार सीडिंग व DBT ऑटो-क्रेडिट एक्टिव'}
            </div>
          </div>

          <div className="p-4 bg-paper-100 rounded-sm border border-paper-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">
                {isEn ? 'Wardha District Central Co-op Bank (Sevagram)' : 'वर्धा जिला मध्यवर्ती सहकारी बैंक (सेवाग्राम)'}
              </span>
              <span className="text-xs font-mono font-bold text-clay-600">IFSC: WDCB0000456</span>
            </div>
            <p className="text-xs text-ink-muted">
              {isEn
                ? 'Credit Officer: Mr. Satish Deshmukh • Phone: 07152-284001 • Branch Code: 0456'
                : 'ऋण अधिकारी: श्री सतीश देशमुख • दूरभाष: 07152-284001 • शाखा कोड: 0456'}
            </p>
            <div className="text-[11px] text-sage-700 font-semibold">
              {isEn ? '✓ Micro-Irrigation Drip Subsidy Credit Linkage Available' : '✓ सूक्ष्म-सिंचाई ड्रिप सब्सिडी क्रेडिट लिंकेज उपलब्ध'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
