import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, FileText } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import { getFarmerLandRecords, getMe } from '../../services/farmerService';
import { isOwnerMismatch, getLandRecordsSummary } from '../../utils/landUtils';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Stamp from '../../components/common/Stamp';
import Button from '../../components/common/Button';
import TermHint from '../../components/common/TermHint';
import ErrorState from '../../components/common/ErrorState';

/**
 * Farmer Land Records Page displaying registered cadastre parcels and title mismatches.
 */
export default function LandRecordsPage() {
  const { t } = useTranslation();
  const { farmerId } = useAuth();
  useDocumentTitle('land.title', 'Revenue Land Records');

  const fetchRecords = useCallback(() => getFarmerLandRecords(farmerId || 'FRM-0003'), [farmerId]);
  const fetchFarmer = useCallback(() => getMe(farmerId || 'FRM-0003'), [farmerId]);

  const { data: records, loading, error, retry } = useAsync(fetchRecords, true, [farmerId]);
  const { data: farmer } = useAsync(fetchFarmer, true, [farmerId]);

  const list = Array.isArray(records) ? records : [];
  const farmerName = farmer?.name || '';
  const summary = useMemo(() => getLandRecordsSummary(list, farmerName), [list, farmerName]);

  const columns = useMemo(
    () => [
      {
        key: 'surveyNumber',
        header: (
          <span className="inline-flex items-center gap-1">
            <span>{t('land.surveyNumber', 'Khasra / Survey No.')}</span>
            <TermHint term="KHASRA" />
          </span>
        ),
        render: (rec) => (
          <div>
            <span className="font-bold font-serif text-base text-indigo-900">
              {rec.surveyNumber}
            </span>
            <div className="text-xs text-ink-muted">
              {rec.village}, {rec.district}
            </div>
          </div>
        ),
      },
      {
        key: 'areaHectares',
        header: t('land.area', 'Land Area'),
        render: (rec) => (
          <span className="tabular-nums font-bold text-indigo-900">
            {rec.areaHectares} ha
          </span>
        ),
      },
      {
        key: 'cropType',
        header: t('land.crop', 'Registered Crop'),
        render: (rec) => (
          <span className="text-xs font-medium text-indigo-900">{rec.cropType}</span>
        ),
      },
      {
        key: 'ownershipStatus',
        header: t('land.ownership', 'Tenure / Status'),
        render: (rec) => <Stamp status={rec.ownershipStatus} />,
      },
      {
        key: 'registeredOwnerName',
        header: t('land.registeredOwner', 'Registered Title Holder'),
        render: (rec) => {
          const mismatch = isOwnerMismatch(farmerName, rec.registeredOwnerName);
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-900">
                  {rec.registeredOwnerName}
                </span>
                {mismatch ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm bg-rust-100 text-rust-600 border border-rust-600 animate-pulse-once">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {t('land.nameMismatch', 'Name Discrepancy')}
                  </span>
                ) : null}
              </div>

              {mismatch ? (
                <div className="flex items-center gap-2 pt-1 text-xs text-ink-muted">
                  <span>{t('land.profileName', 'Your Name')}: <strong>{farmerName}</strong></span>
                  <Link
                    to="/farmer/grievances?category=WRONG_LAND_RECORD&ref=OWNER_NAME_MISMATCH"
                    className="text-clay-500 font-bold hover:underline"
                  >
                    {t('land.fileCorrection', 'File Correction →')}
                  </Link>
                </div>
              ) : null}
            </div>
          );
        },
      },
    ],
    [farmerName, t]
  );

  if (error) {
    return (
      <ErrorState
        title={t('errors.loadFailed', 'Unable to load revenue records')}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={t('land.eyebrow', 'Revenue Cadastre Records')}
        title={t('land.title', 'Land Revenue Ledger')}
        subtitle={t('land.summary', { count: summary.totalPlots, area: summary.totalAreaHectares })}
      />

      {/* Summary KPI Strip with fade-in (M3.2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-paper-100 p-4 border border-indigo-900 rounded-sm shadow-hard-sm animate-fade-in">
        <div>
          <span className="text-xs uppercase font-bold text-ink-muted block">
            {t('land.totalPlots', 'Total Plots')}
          </span>
          <span className="text-2xl font-bold font-serif text-indigo-900 tabular-nums">
            {summary.totalPlots}
          </span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-ink-muted block">
            {t('land.totalArea', 'Total Area')}
          </span>
          <span className="text-2xl font-bold font-serif text-indigo-900 tabular-nums">
            {summary.totalAreaHectares} ha
          </span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-ink-muted block">
            {t('land.mismatchCount', 'Name Mismatches')}
          </span>
          <span className={`text-2xl font-bold font-serif tabular-nums ${summary.mismatchCount > 0 ? 'text-rust-600' : 'text-sage-600'}`}>
            {summary.mismatchCount}
          </span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-ink-muted block">
            {t('land.disputedCount', 'Disputed Parcels')}
          </span>
          <span className={`text-2xl font-bold font-serif tabular-nums ${summary.disputedCount > 0 ? 'text-rust-600' : 'text-indigo-900'}`}>
            {summary.disputedCount}
          </span>
        </div>
      </div>

      {/* Discrepancy Action Banner if any name mismatch exists */}
      {summary.mismatchCount > 0 ? (
        <div className="bg-ochre-100/60 border border-ochre-600 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-hard-sm animate-slide-down">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-ochre-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-indigo-900 text-sm">
                {t('land.mismatchNoticeTitle', 'Land Record Name Discrepancy Flagged')}
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                {t('land.mismatchNoticeDesc', 'The name registered on the digital cadastre does not match your verified profile. This can obstruct KCC loans and crop insurance claims.')}
              </p>
            </div>
          </div>
          <Link to="/farmer/grievances?category=WRONG_LAND_RECORD&ref=OWNER_NAME_MISMATCH" className="shrink-0">
            <Button variant="primary" size="sm" icon={<FileText className="w-4 h-4" />}>
              {t('land.fileGrievanceBtn', 'File Mutation Grievance')}
            </Button>
          </Link>
        </div>
      ) : null}

      {/* Unified Responsive DataTable with staggered row entrance (M3.2) */}
      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        emptyTitle={t('land.emptyTitle', 'No land records registered')}
        emptyDescription={t('land.emptyDesc', 'No land parcels are currently mapped to your farmer profile.')}
      />
    </div>
  );
}
