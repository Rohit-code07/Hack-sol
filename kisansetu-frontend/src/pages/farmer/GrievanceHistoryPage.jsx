import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import {
  PlusCircle,
  Download,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import useToast from '../../hooks/useToast';
import { getGrievances, submitGrievance } from '../../services/grievanceService';
import { formatDate } from '../../utils/formatters';
import { GRIEVANCE_CATEGORIES } from '../../constants';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Stamp from '../../components/common/Stamp';
import Modal from '../../components/common/Modal';
import Field from '../../components/common/Field';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Farmer Grievance Redressal Portal with interactive dispute filing, PDF receipts, and status stepper.
 */
export default function GrievanceHistoryPage() {
  const { t, i18n } = useTranslation();
  const { farmerId, farmerName } = useAuth();
  const toast = useToast();
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle('grievance.title', 'Grievance Redressal Portal');
  const [searchParams, setSearchParams] = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('WRONG_LAND_RECORD');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedGrievance, setSubmittedGrievance] = useState(null);
  const [errorDesc, setErrorDesc] = useState('');

  const fetchGrievances = useCallback(() => getGrievances(farmerId || 'FRM-0003'), [farmerId]);
  const { data: grievancesList, loading, error, retry } = useAsync(fetchGrievances, true, [farmerId]);

  // Pre-fill from query params if directed from DiscrepanciesPage or LandRecordsPage
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlRef = searchParams.get('ref');
    const urlDesc = searchParams.get('desc');

    if (urlCategory || urlRef) {
      if (urlCategory) setCategory(urlCategory);
      if (urlRef || urlDesc) {
        const prefix = urlRef ? `[Discrepancy Ref: ${urlRef}] ` : '';
        const body = urlDesc || '';
        setDescription(`${prefix}${body}`.trim());
      }
      setIsModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenModal = () => {
    setSubmittedGrievance(null);
    setDescription('');
    setErrorDesc('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmittedGrievance(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.trim().length < 20) {
      setErrorDesc(t('grievance.minCharsError', 'Description must be at least 20 characters long.'));
      return;
    }
    setErrorDesc('');
    setSubmitting(true);

    try {
      const res = await submitGrievance({
        farmerId: farmerId || 'FRM-0003',
        category,
        description: description.trim(),
      });
      if (res.success) {
        setSubmittedGrievance(res.data);
        toast.success(t('grievance.submitSuccess', 'Grievance registered successfully'));
        retry();
      }
    } catch (err) {
      toast.error(t('errors.generic', 'Failed to register grievance. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReference = (refNumber) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(refNumber);
      toast.success(`${t('grievance.copiedRef', 'Copied reference number')}: ${refNumber}`);
    }
  };

  const downloadPdfReceipt = (item) => {
    const doc = new jsPDF();
    const g = item || submittedGrievance;
    if (!g) return;

    // Header & Border
    doc.setDrawColor(30, 27, 75); // indigo-900
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);

    doc.setFillColor(244, 237, 224); // paper-100
    doc.rect(11, 11, 188, 30, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 27, 75);
    doc.text('KisanSetu - Farmer Grievance Receipt', 18, 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(181, 83, 42); // clay-500
    doc.text('OFFICIAL ACKNOWLEDGMENT & REDRESSAL AUDIT SLIP', 18, 32);

    doc.setDrawColor(232, 220, 198);
    doc.line(18, 46, 192, 46);

    // Reference Details Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 27, 75);
    doc.text(`Reference No: ${g.referenceNumber}`, 18, 56);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Applicant ID: ${g.farmerId} (${farmerName || 'Ramesh Kumar'})`, 18, 66);
    doc.text(`Category: ${g.category.replace(/_/g, ' ')}`, 18, 74);
    doc.text(`Current Status: ${g.status}`, 18, 82);
    doc.text(`Filing Date: ${new Date(g.createdAt).toLocaleString('en-IN')}`, 18, 90);

    doc.line(18, 98, 192, 98);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Description of Grievance / Discrepancy:', 18, 108);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    // Clean description text
    const cleanDesc = (g.description || '').replace(/[^\x00-\x7F]/g, ' ');
    const splitDesc = doc.splitTextToSize(cleanDesc || g.description, 170);
    doc.text(splitDesc, 18, 118);

    // Official Synthetic Disclaimer Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.line(18, 255, 192, 255);
    doc.text('DEMO PROTOTYPE RECEIPT • SYNTHETIC DATA • NOT CONNECTED TO ANY GOVERNMENT SYSTEM', 18, 264);
    doc.text('Generated via KisanSetu Hackathon Sandbox 2026', 18, 272);

    doc.save(`KisanSetu-Receipt-${g.referenceNumber}.pdf`);
    toast.success(t('grievance.pdfDownloaded', 'PDF Receipt downloaded'));
  };

  const list = Array.isArray(grievancesList) ? grievancesList : [];

  const renderStatusStepper = (status) => {
    const steps = [
      { id: 'OPEN', label: t('grievance.stepSubmitted', 'Submitted') },
      { id: 'IN_REVIEW', label: t('grievance.stepInReview', 'In Review') },
      { id: 'RESOLVED', label: t('grievance.stepResolved', 'Resolved') },
    ];

    const currentIdx = status === 'RESOLVED' ? 2 : status === 'IN_REVIEW' ? 1 : 0;

    return (
      <div className="flex items-center gap-2 pt-2" aria-label="Grievance progress stepper">
        {steps.map((st, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <React.Fragment key={st.id}>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone
                      ? 'bg-clay-500 text-white'
                      : 'bg-paper-200 text-ink-muted'
                  } ${isCurrent && !prefersReducedMotion ? 'animate-scale-in' : ''}`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : idx + 1}
                </span>
                <span
                  className={`text-xs ${
                    isCurrent
                      ? 'font-bold text-indigo-900'
                      : isDone
                      ? 'font-medium text-ink-muted'
                      : 'text-ink-muted/60'
                  }`}
                >
                  {st.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className="h-0.5 w-6 sm:w-10 bg-paper-200 relative overflow-hidden"
                  aria-hidden="true"
                >
                  {/* Progress line fill with 600ms scaleX (M3.5) */}
                  <div
                    className={`h-full bg-clay-500 origin-left ${
                      prefersReducedMotion ? 'transition-none' : 'transition-transform duration-600 ease-out-expo'
                    }`}
                    style={{
                      transform: `scaleX(${idx < currentIdx ? 1 : 0})`,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={t('grievance.eyebrow', 'Public Grievance Redressal')}
        title={t('grievance.title', 'Farmer Grievance Center')}
        subtitle={t('grievance.subtitle', 'Register, track status, and obtain digital acknowledgment slips for revenue & bank disputes.')}
        actions={
          <Button
            variant="primary"
            onClick={handleOpenModal}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            {t('grievance.newBtn', 'File New Grievance')}
          </Button>
        }
      />

      {/* Submission Modal (M3.5, M5.1) */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={submittedGrievance ? t('grievance.successTitle', 'Grievance Acknowledged') : t('grievance.modalTitle', 'File Formal Grievance')}
      >
        {submittedGrievance ? (
          <div className="space-y-5 text-center py-2 animate-fade-in">
            {/* Success state: Check drawing SVG (500ms) + Sage ring scale-in spring (M3.5) */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-sage-100 border-2 border-sage-600 ${
                  prefersReducedMotion ? '' : 'animate-scale-in'
                }`}
              />
              <svg
                className="w-9 h-9 text-sage-600 relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M20 6L9 17L4 12"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: prefersReducedMotion ? 0 : 30,
                  }}
                  className={prefersReducedMotion ? '' : 'animate-draw-check'}
                />
              </svg>
            </div>

            {/* Reference Number with fade-up after check (M3.5) */}
            <div className={prefersReducedMotion ? '' : 'animate-fade-up [animation-delay:250ms]'}>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
                {t('grievance.refLabel', 'Acknowledgment Reference Number')}
              </span>
              <div className="text-xl sm:text-2xl font-bold font-serif text-indigo-900 mt-1 select-all tabular-nums">
                {submittedGrievance.referenceNumber}
              </div>
              <p className="text-xs text-ink-muted mt-2">
                {t('grievance.successNotice', 'Your complaint has been submitted to the Lead Bank Officer and Talathi revenue desk.')}
              </p>
            </div>

            <div className="pt-3 border-t border-paper-200 flex flex-wrap gap-2 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => downloadPdfReceipt(submittedGrievance)}
                icon={<Download className="w-4 h-4" />}
              >
                {t('grievance.downloadPdf', 'Download PDF Receipt')}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyReference(submittedGrievance.referenceNumber)}
                icon={<Copy className="w-4 h-4" />}
              >
                {t('grievance.copyRef', 'Copy Ref')}
              </Button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `KisanSetu Grievance Ref: ${submittedGrievance.referenceNumber} filed for ${category}. Check status online.`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Share2 className="w-4 h-4 text-sage-600" />}
                >
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              id="grv-cat"
              type="select"
              label={t('grievance.category', 'Grievance Category')}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={GRIEVANCE_CATEGORIES.map((c) => ({
                value: c.value,
                label: t(c.labelKey, c.value.replace(/_/g, ' ')),
              }))}
            />

            <div>
              <Field
                id="grv-desc"
                type="textarea"
                label={t('grievance.desc', 'Detailed Complaint Description')}
                required
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value.trim().length >= 20) {
                    setErrorDesc('');
                  }
                }}
                error={errorDesc}
                placeholder={t(
                  'grievance.descPlaceholder',
                  'Explain the discrepancy (e.g. wrong owner name, incorrect survey area, uncredited subsidy)...'
                )}
                rows={5}
                hint={`${description.length} / 1000 (${t('grievance.min20Chars', 'min 20 characters')})`}
                maxLength={1000}
              />
            </div>

            <div className="pt-3 border-t border-paper-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={submitting || description.trim().length < 20}
              >
                {t('grievance.submitBtn', 'Submit Grievance')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* History Ledger List with stagger fade-up (max 8) (M3.5) */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase font-bold tracking-wider text-clay-500">
          {t('grievance.historyTitle', 'Registered Grievance Redressal Audit Trail')}
        </h2>

        {loading ? (
          <div className="space-y-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : error ? (
          <ErrorState
            title={t('errors.loadFailed', 'Unable to load grievance history')}
            onRetry={retry}
          />
        ) : list.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-paper-200 rounded-sm bg-paper-50 p-6 animate-fade-in">
            <p className="text-sm text-ink-muted">
              {t('grievance.empty', 'No complaints or grievances have been filed yet.')}
            </p>
          </div>
        ) : (
          <div className="border border-indigo-900 rounded-sm divide-y divide-paper-200 bg-paper-50 shadow-hard-sm overflow-hidden">
            {list.map((item, idx) => {
              const staggerDelay = prefersReducedMotion ? 0 : Math.min(idx, 7) * 60;
              return (
                <div
                  key={item.id}
                  style={{ animationDelay: `${staggerDelay}ms` }}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-paper-100/60 transition-colors ${
                    prefersReducedMotion ? '' : 'animate-fade-up'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-serif font-bold text-base text-indigo-900 tabular-nums">
                        {item.referenceNumber}
                      </span>
                      <Stamp status={item.status} />
                      <span className="text-xs text-ink-muted font-mono">
                        {formatDate(item.createdAt, i18n.language)}
                      </span>
                    </div>

                    <p className="text-xs text-clay-500 font-bold uppercase tracking-wider">
                      {item.category.replace(/_/g, ' ')}
                    </p>

                    <p className="text-sm text-indigo-900 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>

                    {/* Stepper progress */}
                    {renderStatusStepper(item.status)}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyReference(item.referenceNumber)}
                      icon={<Copy className="w-3.5 h-3.5" />}
                    >
                      {t('grievance.copyRef', 'Copy Ref')}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadPdfReceipt(item)}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      PDF
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
