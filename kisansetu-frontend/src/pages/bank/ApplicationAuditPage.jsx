import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ChevronLeft, ChevronRight, Check, X, Eye } from 'lucide-react';
import { getBankApplications, updateApplicationStatus } from '../../services/bankService';
import { formatDate } from '../../utils/formatters';
import { exportToCsv } from '../../utils/csv';
import useDebounce from '../../hooks/useDebounce';
import useToast from '../../hooks/useToast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Field from '../../components/common/Field';
import Stamp from '../../components/common/Stamp';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

/**
 * Bank Officer Credit Applications Audit Ledger with filtering, CSV export, and status update modals.
 */
export default function ApplicationAuditPage() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  useDocumentTitle('bank.appAuditTitle', 'Credit Applications Audit');

  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedApp, setSelectedApp] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 300);

  const [appsData, setAppsData] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    getBankApplications({
      status,
      from: fromDate,
      to: toDate,
      search: debouncedSearch,
      page,
      limit: pageSize,
    })
      .then((res) => {
        if (res.success || res.items) {
          setAppsData(res.data || res);
        }
      })
      .catch(() => {
        toast.error(t('errors.network', 'Unable to load applications'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, [status, fromDate, toDate, debouncedSearch, page, pageSize]);

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedApp) return;
    try {
      await updateApplicationStatus(selectedApp.id, newStatus);
      toast.success(
        newStatus === 'APPROVED'
          ? t('bank.appApproved', 'Application approved successfully')
          : t('bank.appRejected', 'Application rejected')
      );
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(t('errors.generic', 'Failed to update application'));
    }
  };

  const handleExportCsv = () => {
    if (!appsData.items || appsData.items.length === 0) {
      toast.warning(t('common.empty', 'No data to export'));
      return;
    }
    const cols = [
      { key: 'id', label: 'Application ID' },
      { key: 'farmerId', label: 'Farmer ID' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'submittedAt', label: 'Submitted Date' },
      { key: 'reviewedBy', label: 'Reviewing Officer' },
    ];
    exportToCsv(appsData.items, cols, `kisansetu-applications-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(t('bank.exportSuccess', 'CSV exported successfully'));
  };

  const statusOptions = [
    { value: '', label: t('bank.allStatuses', 'All Statuses') },
    { value: 'PENDING', label: t('bank.statusPending', 'Pending Review') },
    { value: 'APPROVED', label: t('bank.statusApproved', 'Approved') },
    { value: 'REJECTED', label: t('bank.statusRejected', 'Rejected') },
    { value: 'IN_REVIEW', label: t('bank.statusInReview', 'In Review') },
  ];

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: t('bank.colAppId', 'Application Ref'),
        render: (app) => (
          <span className="font-serif font-bold text-base text-indigo-900">
            {app.id}
          </span>
        ),
      },
      {
        key: 'farmerId',
        header: t('bank.farmerIdCol', 'Applicant ID'),
        render: (app) => (
          <span className="font-mono text-xs font-semibold text-clay-500 bg-paper-100 px-2 py-0.5 rounded-sm border border-paper-200">
            {app.farmerId}
          </span>
        ),
      },
      {
        key: 'type',
        header: t('bank.loanTypeCol', 'Credit / Subsidy Scheme'),
        render: (app) => (
          <span className="text-xs font-medium text-indigo-900">
            {app.type.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        key: 'submittedAt',
        header: t('bank.submittedAtCol', 'Filing Date'),
        render: (app) => (
          <span className="text-xs text-ink-muted tabular-nums">
            {formatDate(app.submittedAt, i18n.language)}
          </span>
        ),
      },
      {
        key: 'status',
        header: t('bank.statusCol', 'Status'),
        render: (app) => <Stamp status={app.status} />,
      },
      {
        key: 'actions',
        header: t('bank.actionCol', 'Action'),
        align: 'right',
        render: (app) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedApp(app)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            {t('bank.auditApp', 'Review')}
          </Button>
        ),
      },
    ],
    [t, i18n.language]
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={t('bank.eyebrow', 'Branch Audit Console')}
        title={t('bank.appAuditTitle', 'Loan & Subsidy Application Audit')}
        subtitle={t('bank.appAuditSub', 'Comprehensive audit queue for reviewing and approving farmer credit requests against Bhulekh cadastre validation.')}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-4 h-4 text-clay-500" />}
          >
            {t('bank.exportCsv', 'Export CSV')}
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-paper-100 p-4 border border-indigo-900 rounded-sm shadow-hard-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field
          id="flt-status"
          type="select"
          label={t('bank.filterStatus', 'Filter by Status')}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={statusOptions}
        />

        <Field
          id="flt-search"
          type="text"
          label={t('bank.searchAppOrFarmer', 'Search Application or Farmer')}
          placeholder="e.g. APP-2026-0001, FRM-0003"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
        />

        <Field
          id="flt-from"
          type="date"
          label={t('bank.filterFrom', 'From Date')}
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
        />

        <Field
          id="flt-to"
          type="date"
          label={t('bank.filterTo', 'To Date')}
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Responsive Ledger Table with 150ms page fade (M4.6) */}
      <div key={page} className="animate-fade-in [animation-duration:150ms]">
        <DataTable
          columns={columns}
          data={appsData.items}
          loading={loading}
          onRowClick={(row) => setSelectedApp(row)}
          emptyTitle={t('common.empty', 'No applications found')}
          emptyDescription={t('bank.noAppsFoundDesc', 'Try clearing or modifying the applied filters.')}
        />
      </div>

      {/* Pagination Controls with micro-press buttons (M4.6) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <span className="text-xs text-ink-muted">
          {t('bank.pageIndicator', { current: appsData.page, total: appsData.totalPages })} • {t('bank.totalRecords', { count: appsData.total })}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            {t('common.back', 'Previous')}
          </Button>

          <span className="text-xs font-bold text-indigo-900 px-2 tabular-nums">
            {page} / {appsData.totalPages || 1}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={page >= appsData.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            {t('common.next', 'Next')}
          </Button>
        </div>
      </div>

      {/* Detail / Action Modal (M5.1) */}
      {selectedApp ? (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`${t('bank.applicationDetails', 'Application Details')}: ${selectedApp.id}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-3 bg-paper-100 rounded-sm border border-paper-200">
              <div>
                <span className="text-xs font-bold text-ink-muted uppercase block">
                  {t('bank.colAppId', 'Application ID')}
                </span>
                <span className="font-mono font-bold text-indigo-900">
                  {selectedApp.id}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-ink-muted uppercase block">
                  {t('bank.farmerIdCol', 'Farmer ID')}
                </span>
                <span className="font-mono font-bold text-indigo-900">
                  {selectedApp.farmerId}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-ink-muted uppercase block">
                  {t('bank.statusCol', 'Status')}
                </span>
                <Stamp status={selectedApp.status} />
              </div>
              <div>
                <span className="text-xs font-bold text-ink-muted uppercase block">
                  {t('bank.loanTypeCol', 'Scheme / Type')}
                </span>
                <span className="font-semibold text-indigo-900">
                  {selectedApp.type.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-ink-muted uppercase block">
                  {t('bank.submittedAtCol', 'Date')}
                </span>
                <span className="font-mono text-indigo-900">
                  {formatDate(selectedApp.submittedAt, i18n.language)}
                </span>
              </div>
            </div>

            {selectedApp.remarks ? (
              <div className="p-3 bg-paper-100 border border-paper-200 rounded-sm">
                <span className="text-xs font-bold text-ink-muted uppercase block mb-1">
                  {t('bank.remarks', 'Audit Remarks')}
                </span>
                <p className="text-xs text-indigo-900">{selectedApp.remarks}</p>
              </div>
            ) : null}

            {/* Officer Action Buttons for Pending/In Review Apps */}
            {['PENDING', 'IN_REVIEW'].includes(selectedApp.status) ? (
              <div className="pt-4 border-t border-paper-200 flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleStatusUpdate('REJECTED')}
                  icon={<X className="w-4 h-4" />}
                >
                  {t('bank.rejectApp', 'Reject Application')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusUpdate('APPROVED')}
                  icon={<Check className="w-4 h-4" />}
                >
                  {t('bank.approveApp', 'Approve Application')}
                </Button>
              </div>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
