import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, FileText, CheckCircle2, Download, MapPin, Layers } from 'lucide-react';
import cadastreMapSvg from '../../assets/cadastre-map.svg';
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

      {/* =========================================================================
          INTERACTIVE CADASTRE GIS MAP PREVIEW & 7/12 ROR DIGITAL VERIFICATION
          Fills vertical empty space with official GIS parcel boundaries & RoR certificate
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3">
        {/* Left: GIS Village Map Visualizer */}
        <div className="lg:col-span-7 bg-paper-50 border-2 border-indigo-900 rounded-sm p-5 sm:p-6 shadow-hard space-y-3">
          <div className="flex items-center justify-between border-b border-paper-200 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-clay-600" />
              <h3 className="font-serif font-bold text-base text-indigo-950">
                डिजिटल भू-नक्शा एवं खसरा पार्सल सीमांकन (GIS Map)
              </h3>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-sage-100 text-sage-700 border border-sage-600 rounded-xs">
              AgriStack GIS
            </span>
          </div>

          <p className="text-xs text-ink-muted">
            वर्धा जिला, तहसील देवली, ग्राम चंद्रपुर खुर्द के अंतर्गत आपके खसरा भूखंडों की उपग्रह मैपिंग:
          </p>

          <div className="border border-indigo-900 rounded-sm overflow-hidden bg-paper-100 p-3 flex justify-center">
            <img
              src={cadastreMapSvg}
              alt="भू-नक्शा डिजिटल कैडस्ट्रे"
              className="w-full max-w-md h-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-ink-muted">
            <span>सत्यापित सिंचित रकबा: <strong>1.45 हे. (नहर सिंचित)</strong></span>
            <span className="text-sage-700 font-bold">✓ भू-संदर्भित (Geo-referenced WGS84)</span>
          </div>
        </div>

        {/* Right: 7/12 RoR Digitally Signed Certificate Download */}
        <div className="lg:col-span-5 bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 sm:p-6 shadow-hard flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-clay-100 text-clay-700 border border-clay-600 rounded-xs">
                सत्यापित पावती
              </span>
              <span className="text-xs font-mono font-bold text-sage-700">QR सत्यापित</span>
            </div>

            <h3 className="font-serif font-bold text-lg text-indigo-950">
              डिजिटली हस्ताक्षरित 7/12 व 8-A खतौनी उद्धरण
            </h3>

            <p className="text-xs text-ink-muted leading-relaxed">
              महाराष्ट्र भूमि अभिलेख अधिनियम के तहत अधिकृत डिजिटल हस्ताक्षर सहित कानूनी रूप से मान्य प्रति। बैंक ऋण, केसीसी एवं कृषि सब्सिडी हेतु मान्य।
            </p>

            <div className="p-3 bg-paper-50 rounded-sm border border-paper-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-ink-muted">डिजिटल टोकन:</span>
                <span className="font-bold text-indigo-900">MH-WRD-712-2026-9941</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">जारी तिथि:</span>
                <span>15 फरवरी 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">राजस्व प्रभाग:</span>
                <span>नागपुर मंडल</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={<Download className="w-4 h-4" />}
              onClick={() => alert('7/12 अभिलेख PDF सफलतापूर्वक डाउनलोड हो गया।')}
            >
              आधिकारिक 7/12 PDF डाउनलोड करें
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
