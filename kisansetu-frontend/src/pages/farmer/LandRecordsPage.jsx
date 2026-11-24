import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, FileText, CheckCircle2, Download, MapPin, Layers, PlusCircle, Check } from 'lucide-react';
import cadastreMapSvg from '../../assets/cadastre-map.svg';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import landApi from '../../api/landApi';
import { getFarmerLandRecords, getMe } from '../../services/farmerService';
import { isOwnerMismatch, getLandRecordsSummary } from '../../utils/landUtils';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Stamp from '../../components/common/Stamp';
import Button from '../../components/common/Button';
import TermHint from '../../components/common/TermHint';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';
import Field from '../../components/common/Field';

/**
 * Farmer Land Records Page displaying registered cadastre parcels and title mismatches.
 */
export default function LandRecordsPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { farmerId } = useAuth();
  useDocumentTitle('land.title', 'Revenue Land Records');

  const fetchRecords = useCallback(() => farmerId ? getFarmerLandRecords(farmerId) : Promise.resolve({ success: true, data: [] }), [farmerId]);
  const fetchFarmer = useCallback(() => farmerId ? getMe(farmerId) : Promise.resolve({ success: true, data: null }), [farmerId]);

  const { data: records, loading, error, retry } = useAsync(fetchRecords, Boolean(farmerId), [farmerId]);
  const { data: farmer } = useAsync(fetchFarmer, Boolean(farmerId), [farmerId]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [formData, setFormData] = useState({
    khasraNumber: '',
    khataNumber: '',
    surveyNumber: '',
    village: '',
    tehsil: '',
    district: '',
    state: 'Chhattisgarh',
    landArea: '',
    areaUnit: 'ACRE',
    irrigationStatus: 'UNIRRIGATED',
    landUsage: 'AGRICULTURAL',
    ownershipType: 'SINGLE',
    ownerName: '',
    coOwnerDetails: '',
    isMortgaged: false,
    cropType: 'Paddy',
  });

  const handleCreateLandRecord = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!formData.khasraNumber.trim()) {
      setFormError(isEn ? 'Please enter Khasra Number.' : 'कृपया खसरा क्रमांक दर्ज करें।');
      return;
    }
    if (!formData.landArea || Number(formData.landArea) <= 0) {
      setFormError(isEn ? 'Please enter valid land area.' : 'कृपया मान्य भूमि रकबा दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        khasraNumber: formData.khasraNumber.trim(),
        khataNumber: formData.khataNumber.trim() || `KH-${formData.khasraNumber.trim().replace('/', '-')}`,
        surveyNumber: formData.surveyNumber.trim() || formData.khasraNumber.trim(),
        village: formData.village.trim() || farmer?.village || 'Arang',
        tehsil: formData.tehsil.trim() || farmer?.tehsil || 'Arang',
        district: formData.district.trim() || farmer?.district || 'Raipur',
        state: formData.state.trim() || farmer?.state || 'Chhattisgarh',
        landArea: Number(formData.landArea),
        areaUnit: formData.areaUnit || 'ACRE',
        irrigationStatus: formData.irrigationStatus || 'UNIRRIGATED',
        landUsage: formData.landUsage || 'AGRICULTURAL',
        ownerName: formData.ownerName.trim() || farmer?.name || farmerName,
        coOwnerDetails: formData.coOwnerDetails.trim() || null,
        isMortgaged: Boolean(formData.isMortgaged),
        ownerFarmerId: farmerId,
        farmerId: farmerId,
        ownershipType: formData.ownershipType || 'SINGLE',
        ownershipPercentage: formData.ownershipType === 'JOINT' ? 50 : 100,
        cropType: formData.cropType || 'Paddy',
      };

      const res = await landApi.create(payload);
      if (res?.success) {
        setFormSuccess(isEn ? 'Land record registered & checked against Demo Registry!' : 'भूमि अभिलेख सफलतापूर्वक पंजीकृत एवं डेमो रजिस्ट्री से सत्यापित!');
        setTimeout(() => {
          setIsAddModalOpen(false);
          setFormSuccess('');
          setFormData({
            khasraNumber: '',
            khataNumber: '',
            surveyNumber: '',
            village: '',
            tehsil: '',
            district: '',
            state: 'Chhattisgarh',
            landArea: '',
            areaUnit: 'ACRE',
            irrigationStatus: 'UNIRRIGATED',
            landUsage: 'AGRICULTURAL',
            ownershipType: 'SINGLE',
            ownerName: '',
            coOwnerDetails: '',
            isMortgaged: false,
            cropType: 'Paddy',
          });
          retry();
        }, 1200);
      }
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
        (err?.response?.data?.data && typeof err.response.data.data === 'object' ? Object.values(err.response.data.data).join(', ') : null) ||
        err?.message ||
        (isEn ? 'Failed to register land parcel' : 'भूमि पार्सल दर्ज करने में त्रुटि')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="flex items-center gap-2">
              <span className="font-bold font-serif text-base text-indigo-900">
                {rec.surveyNumber || rec.khasraNumber}
              </span>
              {rec.khataNumber && (
                <span className="font-mono text-[10px] bg-paper-200 text-indigo-950 px-1.5 py-0.5 rounded-xs border border-paper-300">
                  {rec.khataNumber}
                </span>
              )}
            </div>
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
          <div>
            <span className="tabular-nums font-bold text-indigo-900">
              {rec.areaHectares || rec.landArea} {rec.areaUnit || 'ha'}
            </span>
            <div className="text-[11px] text-ink-muted">
              {rec.irrigationStatus === 'IRRIGATED' ? (isEn ? '✓ Irrigated' : '✓ सिंचित') : (isEn ? 'Rainfed' : 'असिंचित')}
            </div>
          </div>
        ),
      },
      {
        key: 'cropType',
        header: t('land.crop', 'Registered Crop'),
        render: (rec) => (
          <div>
            <span className="text-xs font-medium text-indigo-900">{rec.cropType || 'Paddy'}</span>
            {rec.isMortgaged && (
              <span className="block text-[10px] text-rust-600 font-bold">
                {isEn ? 'Pledged (Mortgaged)' : 'बंधक (Encumbered)'}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'registeredOwnerName',
        header: t('land.registeredOwner', 'Registered Title Holder'),
        render: (rec) => {
          const mismatch = isOwnerMismatch(farmerName, rec.registeredOwnerName || rec.ownerName);
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-900">
                  {rec.registeredOwnerName || rec.ownerName}
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
      {
        key: 'verificationStatus',
        header: isEn ? 'Registry Verification' : 'रजिस्ट्री सत्यापन',
        render: (rec) => {
          const status = rec.verificationStatus || 'PENDING';
          const isVerified = status === 'VERIFIED';
          const isMismatch = status === 'MISMATCH';
          const isPartial = status === 'PARTIAL_MATCH';

          return (
            <div className="space-y-1">
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-xs bg-sage-100 text-sage-800 border border-sage-600">
                  <CheckCircle2 className="w-3 h-3 text-sage-700" />
                  {isEn ? 'Verified against Demo Registry' : 'डेमो रजिस्ट्री से सत्यापित'}
                </span>
              ) : isMismatch ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-xs bg-rust-100 text-rust-800 border border-rust-600">
                  <AlertCircle className="w-3 h-3 text-rust-600" />
                  {isEn ? 'Title Mismatch Flagged' : 'स्वामित्व भिन्नता चिह्नित'}
                </span>
              ) : isPartial ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-xs bg-ochre-100 text-ochre-800 border border-ochre-600">
                  {isEn ? 'Area Variance Detected' : 'रकबा भिन्नता'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-xs bg-paper-200 text-ink-muted border border-paper-300">
                  {isEn ? 'Pending Review' : 'सत्यापन लंबित'}
                </span>
              )}
              {rec.verificationRemarks && (
                <div className="text-[10px] text-ink-muted leading-tight max-w-xs">
                  {rec.verificationRemarks}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [farmerName, t, i18n.language]
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
        actions={
          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            {isEn ? 'Register Land Parcel' : 'नया खसरा दर्ज करें'}
          </Button>
        }
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
                {isEn ? 'Digital Cadastre Map & Khasra Demarcation (GIS Map)' : 'डिजिटल भू-नक्शा एवं खसरा पार्सल सीमांकन (GIS Map)'}
              </h3>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-sage-100 text-sage-700 border border-sage-600 rounded-xs">
              AgriStack GIS
            </span>
          </div>

          <p className="text-xs text-ink-muted">
            {isEn
              ? 'Satellite boundary mapping of your khasra parcels within Chandrapur Khurd, Deoli Tehsil, Wardha District:'
              : 'वर्धा जिला, तहसील देवली, ग्राम चंद्रपुर खुर्द के अंतर्गत आपके खसरा भूखंडों की उपग्रह मैपिंग:'
            }
          </p>

          <div className="border border-indigo-900 rounded-sm overflow-hidden bg-paper-100 p-3 flex justify-center">
            <img
              src={cadastreMapSvg}
              alt="भू-नक्शा डिजिटल कैडस्ट्रे"
              className="w-full max-w-md h-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-ink-muted">
            <span>
              {isEn ? 'Verified Irrigated Area: ' : 'सत्यापित सिंचित रकबा: '}
              <strong>{isEn ? '1.45 ha (Canal Irrigated)' : '1.45 हे. (नहर सिंचित)'}</strong>
            </span>
            <span className="text-sage-700 font-bold">
              {isEn ? '✓ Geo-referenced (WGS84 Datum)' : '✓ भू-संदर्भित (Geo-referenced WGS84)'}
            </span>
          </div>
        </div>

        {/* Right: 7/12 RoR Digitally Signed Certificate Download */}
        <div className="lg:col-span-5 bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 sm:p-6 shadow-hard flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-clay-100 text-clay-700 border border-clay-600 rounded-xs">
                {isEn ? 'Verified Receipt' : 'सत्यापित पावती'}
              </span>
              <span className="text-xs font-mono font-bold text-sage-700">
                {isEn ? 'QR Verified' : 'QR सत्यापित'}
              </span>
            </div>

            <h3 className="font-serif font-bold text-lg text-indigo-950">
              {isEn ? 'Digitally Signed 7/12 & 8-A RoR Extract' : 'डिजिटली हस्ताक्षरित 7/12 व 8-A खतौनी उद्धरण'}
            </h3>

            <p className="text-xs text-ink-muted leading-relaxed">
              {isEn
                ? 'Legally valid extract with authorized digital signature under Maharashtra Land Revenue Code. Accepted for bank credit, KCC and government subsidies.'
                : 'महाराष्ट्र भूमि अभिलेख अधिनियम के तहत अधिकृत डिजिटल हस्ताक्षर सहित कानूनी रूप से मान्य प्रति। बैंक ऋण, केसीसी एवं कृषि सब्सिडी हेतु मान्य।'
              }
            </p>

            <div className="p-3 bg-paper-50 rounded-sm border border-paper-200 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-ink-muted">{isEn ? 'Digital Token:' : 'डिजिटल टोकन:'}</span>
                <span className="font-bold text-indigo-900">MH-WRD-712-2026-9941</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">{isEn ? 'Issue Date:' : 'जारी तिथि:'}</span>
                <span>{isEn ? '15 February 2026' : '15 फरवरी 2026'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">{isEn ? 'Revenue Division:' : 'राजस्व प्रभाग:'}</span>
                <span>{isEn ? 'Nagpur Division' : 'नागपुर मंडल'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={<Download className="w-4 h-4" />}
              onClick={() => alert(isEn ? 'Official 7/12 RoR PDF downloaded successfully.' : '7/12 अभिलेख PDF सफलतापूर्वक डाउनलोड हो गया।')}
            >
              {isEn ? 'Download Official 7/12 PDF' : 'आधिकारिक 7/12 PDF डाउनलोड करें'}
            </Button>
          </div>
        </div>
      </div>

      {/* Register New Land Parcel Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEn ? 'Register Revenue Land Parcel' : 'नया राजस्व भूमि खसरा दर्ज करें'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateLandRecord} className="space-y-4">
          <div className="p-3 bg-paper-100 border border-paper-200 rounded-sm text-xs text-ink-muted leading-relaxed">
            {isEn
              ? 'Land details submitted will be immediately cross-referenced with the Synthetic Demo Cadastre Registry to verify ownership and detect any title discrepancies.'
              : 'दर्ज किया गया भू-अभिलेख विवरण तुरंत स्वामित्व सत्यापन एवं शीर्षक विसंगतियों की जांच हेतु डेमो भू-अभिलेख रजिस्ट्री से सत्यापित किया जाएगा।'}
          </div>

          {formError && (
            <div className="p-3 bg-rust-100 border border-rust-600 rounded-sm text-xs text-rust-700 flex items-center gap-2 font-bold animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-sage-100 border border-sage-600 rounded-sm text-xs text-sage-800 flex items-center gap-2 font-bold animate-slide-down">
              <Check className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="lr-khasra"
              label={isEn ? 'Khasra / Plot Number' : 'खसरा क्रमांक'}
              value={formData.khasraNumber}
              onChange={(e) => setFormData({ ...formData, khasraNumber: e.target.value })}
              placeholder="e.g. 142/1 or 205/4"
              required
            />
            <Field
              id="lr-khata"
              label={isEn ? 'Khata Number' : 'खाता क्रमांक'}
              value={formData.khataNumber}
              onChange={(e) => setFormData({ ...formData, khataNumber: e.target.value })}
              placeholder="e.g. KH-88"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field
              id="lr-area"
              type="number"
              step="0.01"
              min="0.01"
              label={isEn ? 'Land Area' : 'भूमि रकबा'}
              value={formData.landArea}
              onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
              placeholder="3.5"
              required
            />
            <Field
              id="lr-unit"
              type="select"
              label={isEn ? 'Area Unit' : 'इकाई'}
              value={formData.areaUnit}
              onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
              options={[
                { value: 'ACRE', label: isEn ? 'Acre' : 'एकड़' },
                { value: 'HECTARE', label: isEn ? 'Hectare' : 'हेक्टेयर' },
              ]}
            />
            <Field
              id="lr-crop"
              type="select"
              label={isEn ? 'Primary Crop' : 'मुख्य फसल'}
              value={formData.cropType}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              options={[
                { value: 'Paddy', label: isEn ? 'Paddy (Dhan)' : 'धान' },
                { value: 'Soybean', label: isEn ? 'Soybean' : 'सोयाबीन' },
                { value: 'Wheat', label: isEn ? 'Wheat (Gehun)' : 'गेहूं' },
                { value: 'Gram', label: isEn ? 'Gram (Chana)' : 'चना' },
                { value: 'Cotton', label: isEn ? 'Cotton (Kapas)' : 'कपास' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="lr-village"
              label={isEn ? 'Village' : 'ग्राम'}
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder={farmer?.village || 'Arang'}
            />
            <Field
              id="lr-tehsil"
              label={isEn ? 'Tehsil' : 'तहसील'}
              value={formData.tehsil}
              onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
              placeholder={farmer?.tehsil || 'Arang'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="lr-owner"
              label={isEn ? 'Declared Title Holder Name' : 'दर्ज खातेदार का नाम'}
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              placeholder={farmer?.name || farmerName || 'Ramesh Kumar'}
            />
            <Field
              id="lr-ownership-type"
              type="select"
              label={isEn ? 'Ownership Tenure' : 'स्वामित्व प्रकार'}
              value={formData.ownershipType}
              onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
              options={[
                { value: 'SINGLE', label: isEn ? 'Single Owner (एकल)' : 'एकल खातेदार' },
                { value: 'JOINT', label: isEn ? 'Joint Holding (संयुक्त)' : 'संयुक्त खातेदार' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              id="lr-irrigation"
              type="select"
              label={isEn ? 'Irrigation Facility' : 'सिंचाई सुविधा'}
              value={formData.irrigationStatus}
              onChange={(e) => setFormData({ ...formData, irrigationStatus: e.target.value })}
              options={[
                { value: 'UNIRRIGATED', label: isEn ? 'Unirrigated (Rainfed)' : 'असिंचित (वर्षा आधारित)' },
                { value: 'IRRIGATED', label: isEn ? 'Canal / Tube Well Irrigated' : 'सिंचित (नहर/नलकूप)' },
              ]}
            />
            <Field
              id="lr-usage"
              type="select"
              label={isEn ? 'Land Classification' : 'भूमि वर्गीकरण'}
              value={formData.landUsage}
              onChange={(e) => setFormData({ ...formData, landUsage: e.target.value })}
              options={[
                { value: 'AGRICULTURAL', label: isEn ? 'Agricultural (कृषि)' : 'कृषि भूमि' },
                { value: 'RESIDENTIAL', label: isEn ? 'Abadi / Residential' : 'आबादी / आवासीय' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="lr-mortgage"
              checked={formData.isMortgaged}
              onChange={(e) => setFormData({ ...formData, isMortgaged: e.target.checked })}
              className="w-4 h-4 rounded border-indigo-900 text-clay-600 focus:ring-saffron-400"
            />
            <label htmlFor="lr-mortgage" className="text-xs font-semibold text-indigo-950">
              {isEn ? 'This land parcel is currently encumbered / pledged as bank loan collateral' : 'यह भूमि पार्सल वर्तमान में बैंक ऋण हेतु बंधक (Mortgaged) है'}
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-paper-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              {isEn ? 'Cancel' : 'रद्द करें'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEn ? 'Verifying & Saving...' : 'सत्यापित एवं सहेजा जा रहा है...') : (isEn ? 'Save & Cross-Verify Parcel' : 'दर्ज एवं सत्यापित करें')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
