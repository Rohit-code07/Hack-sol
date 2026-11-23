import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, AlertOctagon } from 'lucide-react';
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
        header: t('loans.bank', 'Lender / Bank'),
        render: (loan) => (
          <div>
            <div className="font-bold text-indigo-900">{loan.bankName}</div>
            <div className="text-xs text-ink-muted">{loan.loanType}</div>
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
        eyebrow={t('loans.eyebrow', 'Institutional Credit Accounts')}
        title={t('loans.title', 'Farmer Credit Ledger')}
        subtitle={t('loans.subtitle', 'Live tracking of sanctioned limits, outstanding balances, and repayment standing.')}
      />

      {/* Summary KPI Cards with CountUp (M3.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={t('loans.totalSanctioned', 'Total Sanctioned')}
          value={
            <CountUp
              value={totalSanctioned}
              format={(val) => formatCurrency(val, i18n.language)}
            />
          }
          helperText={t('loans.totalSanctionedSub', 'Across all linked bank accounts')}
          accent="indigo"
          loading={loading}
        />

        <StatCard
          label={t('loans.totalOutstanding', 'Total Outstanding')}
          value={
            <CountUp
              value={totalOutstanding}
              format={(val) => formatCurrency(val, i18n.language)}
            />
          }
          helperText={t('loans.totalOutstandingSub', 'Current balance due')}
          accent="clay"
          loading={loading}
        />

        <StatCard
          label={t('loans.npaCount', 'Overdue / NPA Accounts')}
          value={<CountUp value={npaList.length} />}
          helperText={t('loans.npaSub', 'Accounts requiring regularisation')}
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
              {t('loans.npaNoticeTitle', 'NPA Notice: Immediate Regularisation Required')}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-8">
            {t('loans.npaNoticeDesc', 'One or more of your loan accounts has unpaid dues over 90 days. This restricts fresh KCC scale enhancement and interest subvention subsidies. Please visit your bank branch to request a restructuring or one-time settlement plan.')}
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
    </div>
  );
}
