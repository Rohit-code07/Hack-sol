import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  History,
  Copy,
  Printer,
  Info,
} from 'lucide-react';
import { verifyLand } from '../../services/bankService';
import { verificationHistory } from '../../constants/mockData';
import { formatDate } from '../../utils/formatters';
import useToast from '../../hooks/useToast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Field from '../../components/common/Field';
import Panel from '../../components/common/Panel';
import Stamp from '../../components/common/Stamp';
import Button from '../../components/common/Button';
import TermHint from '../../components/common/TermHint';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Cadastre Cross-Registry Land Verification Tool for Bank Credit Officers.
 */
export default function LandVerificationPage() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle('bank.landVerificationTitle', 'Cross-Registry Land Verification');

  const [surveyNumber, setSurveyNumber] = useState('102/1');
  const [farmerId, setFarmerId] = useState('FRM-0003');
  const [loading, setLoading] = useState(false);
  const [verdictResult, setVerdictResult] = useState(null);
  const [recentChecks, setRecentChecks] = useState(verificationHistory);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!surveyNumber.trim() || !farmerId.trim()) return;

    setLoading(true);
    try {
      const res = await verifyLand({
        surveyNumber: surveyNumber.trim(),
        farmerId: farmerId.trim().toUpperCase(),
      });
      if (res.success) {
        setVerdictResult(res.data);
        const newEntry = {
          id: `VER-${Date.now()}`,
          surveyNumber: surveyNumber.trim(),
          farmerId: farmerId.trim().toUpperCase(),
          timestamp: new Date().toISOString(),
          verdict: res.data.verdict,
          ownerMatch: res.data.ownerMatch,
          areaMatch: res.data.areaMatch,
          notes: res.data.notes,
          isNew: true,
        };
        setRecentChecks((prev) => [newEntry, ...prev.slice(0, 4)]);
        toast.info(
          res.data.verdict === 'VERIFIED'
            ? t('bank.verifiedSuccess', 'Survey parcel verified clean')
            : t('bank.mismatchFlagged', 'Discrepancy flagged during audit')
        );
      }
    } catch (err) {
      toast.error(t('errors.generic', 'Verification query failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!verdictResult) return;
    const text = `KisanSetu Land Verification Audit:\nSurvey: ${surveyNumber}\nFarmer: ${farmerId}\nVerdict: ${verdictResult.verdict}\nOwner Match: ${verdictResult.ownerMatch ? 'YES' : 'NO'}\nArea Match: ${verdictResult.areaMatch ? 'YES' : 'NO'}\nNotes: ${verdictResult.notes?.join(' ')}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      toast.success(t('bank.auditCopied', 'Audit summary copied to clipboard'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const historyColumns = useMemo(
    () => [
      {
        key: 'surveyNumber',
        header: t('land.surveyNumber', 'Survey No.'),
        render: (row) => (
          <span className="font-mono font-bold text-indigo-900">{row.surveyNumber}</span>
        ),
      },
      {
        key: 'farmerId',
        header: t('bank.farmerIdCol', 'Applicant ID'),
        render: (row) => (
          <span className="font-mono font-semibold text-clay-500">{row.farmerId}</span>
        ),
      },
      {
        key: 'ownerMatch',
        header: t('bank.titleHolderMatch', 'Title Match'),
        render: (row) => (
          <div className="flex items-center gap-1.5 font-medium text-xs">
            {row.ownerMatch ? (
              <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rust-600 shrink-0" />
            )}
            <span>{row.ownerMatch ? t('bank.matched', 'Matched') : t('bank.mismatched', 'Mismatch')}</span>
          </div>
        ),
      },
      {
        key: 'areaMatch',
        header: t('bank.areaMatch', 'Area Match'),
        render: (row) => (
          <div className="flex items-center gap-1.5 font-medium text-xs">
            {row.areaMatch ? (
              <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rust-600 shrink-0" />
            )}
            <span>{row.areaMatch ? t('bank.matched', 'Matched') : t('bank.mismatched', 'Mismatch')}</span>
          </div>
        ),
      },
      {
        key: 'verdict',
        header: t('bank.verdictCol', 'Audit Verdict'),
        render: (row) => <Stamp status={row.verdict} animate={false} />,
      },
      {
        key: 'timestamp',
        header: t('bank.verifiedAtCol', 'Timestamp'),
        render: (row) => (
          <span className="text-xs text-ink-muted">
            {formatDate(row.timestamp, i18n.language)}
          </span>
        ),
      },
    ],
    [t, i18n.language]
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={t('bank.eyebrow', 'Branch Audit Console')}
        title={t('bank.landVerificationTitle', 'Cross-Registry Cadastre Verification')}
        subtitle={t('bank.landVerificationSub', 'Automated cross-check between state Bhulekh revenue records and applicant credit files.')}
      />

      {/* Query Form Panel */}
      <Panel accent="indigo" className="shadow-hard-sm">
        <form onSubmit={handleVerify} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <Field
              id="ver-survey"
              label={
                <span className="inline-flex items-center gap-1">
                  <span>{t('bank.surveyInputLabel', 'Khasra / Survey Number')}</span>
                  <TermHint term="KHASRA" />
                </span>
              }
              required
              value={surveyNumber}
              onChange={(e) => setSurveyNumber(e.target.value)}
              placeholder="e.g. 102/1, 45/2"
            />
          </div>

          <div className="md:col-span-4">
            <Field
              id="ver-farmer"
              label={t('bank.farmerIdInputLabel', 'Applicant Farmer ID')}
              required
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value.toUpperCase())}
              placeholder="e.g. FRM-0003"
              hint="Format: FRM-XXXX"
            />
          </div>

          <div className="md:col-span-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {t('bank.verifyBtn', 'Verify Cadastre')}
            </Button>
          </div>
        </form>
      </Panel>

      {/* Two-Column Comparison Verdict Card with slide-down (M4.5) */}
      {verdictResult && (
        <Panel
          accent={verdictResult.verdict === 'VERIFIED' ? 'sage' : 'rust'}
          className={`shadow-hard-lg space-y-5 ${
            prefersReducedMotion ? '' : 'animate-slide-down [animation-duration:280ms]'
          }`}
        >
          {/* Verdict Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-200 pb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-clay-500 block">
                {t('bank.verdictTitle', 'Statutory Cross-Match Verdict')}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-indigo-900 mt-0.5">
                {t('land.surveyNumber', 'Khasra')} {surveyNumber} • {farmerId}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Stamp
                status={verdictResult.verdict}
                rotate
                animate
                size="md"
              />
              <div className="flex items-center gap-1.5 no-print">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopySummary}
                  icon={<Copy className="w-3.5 h-3.5" />}
                >
                  {t('bank.copySummary', 'Copy')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrint}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  {t('bank.printAudit', 'Print')}
                </Button>
              </div>
            </div>
          </div>

          {/* Two-Column Comparison Grid: Revenue Registry vs Applicant Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: State Revenue Registry Record */}
            <div className="bg-paper-100 p-4 rounded-sm border border-indigo-900 space-y-3">
              <div className="flex items-center justify-between border-b border-paper-200 pb-2">
                <span className="text-xs uppercase font-bold text-indigo-900 tracking-wider">
                  01 • {t('bank.revenueCadastre', 'Bhulekh State Revenue Cadastre')}
                </span>
                <span className="text-[11px] font-mono text-ink-muted">Official RoR</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">{t('land.registeredOwner', 'Registered Owner')}:</span>
                  <span className="font-bold text-indigo-900">
                    {verdictResult.registeredOwner || 'Ramesh Kumar (Title Holder)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">{t('land.area', 'Registered Area')}:</span>
                  <span className="font-bold text-indigo-900 tabular-nums">
                    {verdictResult.areaHectares ? `${verdictResult.areaHectares} ha` : '2.40 ha'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">{t('land.crop', 'Recorded Crop')}:</span>
                  <span className="font-medium text-indigo-900">
                    {verdictResult.cropType || 'Soybean'}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Bank Credit Application Record with draw-in icons (M4.5) */}
            <div className="bg-paper-100 p-4 rounded-sm border border-indigo-900 space-y-3">
              <div className="flex items-center justify-between border-b border-paper-200 pb-2">
                <span className="text-xs uppercase font-bold text-clay-500 tracking-wider">
                  02 • {t('bank.bankApplication', 'Bank Loan Application File')}
                </span>
                <span className="font-mono text-ink-muted">{farmerId}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">{t('bank.applicantName', 'Applicant Profile Name')}:</span>
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <span>{farmerId === 'FRM-0003' ? 'Ramesh Kumar' : farmerId}</span>
                    <span className={prefersReducedMotion ? '' : 'animate-scale-in [animation-duration:300ms]'}>
                      {verdictResult.ownerMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-sage-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rust-600" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">{t('bank.claimedArea', 'Claimed Area for Sanction')}:</span>
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 tabular-nums">
                    <span>{verdictResult.areaHectares ? `${verdictResult.areaHectares} ha` : '2.40 ha'}</span>
                    <span className={prefersReducedMotion ? '' : 'animate-scale-in [animation-duration:300ms] [animation-delay:150ms]'}>
                      {verdictResult.areaMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-sage-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rust-600" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-ink-muted">{t('bank.matchStatus', 'Registry Alignment')}:</span>
                  <span className={`font-bold ${verdictResult.ownerMatch ? 'text-sage-600' : 'text-rust-600'}`}>
                    {verdictResult.ownerMatch ? t('bank.titleClear', 'Clear Title') : t('bank.nameMismatchFlag', 'Discrepancy Detected')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Notes List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs uppercase font-bold tracking-wider text-clay-500 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>{t('bank.auditNotes', 'Official Statutory Audit Findings')}</span>
            </span>
            <ul className="space-y-1.5 bg-paper-50 p-4 rounded-sm border border-indigo-900 text-xs">
              {verdictResult.notes?.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 text-indigo-900 leading-relaxed">
                  <span className="font-bold text-clay-500">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      )}

      {/* Session History via DataTable */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-clay-500" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-clay-500">
            {t('bank.sessionHistoryTitle', 'Recent Verification Audit History')}
          </h2>
        </div>

        <DataTable
          columns={historyColumns}
          data={recentChecks}
          getRowClassName={(row) => (row.isNew ? 'animate-slide-in-right' : '')}
          emptyTitle={t('bank.noHistory', 'No verification checks recorded')}
        />
      </div>
    </div>
  );
}
