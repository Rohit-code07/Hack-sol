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
  Clock,
  ShieldCheck,
  Building2,
  UserCheck,
  PhoneCall,
  ExternalLink,
  FileText,
  FileDown,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import aiApi from '../../api/aiApi';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import useToast from '../../hooks/useToast';
import { getGrievances, submitGrievance, downloadGrievancePdf } from '../../services/grievanceService';
import { formatDate } from '../../utils/formatters';
import { GRIEVANCE_CATEGORIES } from '../../constants';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import ListenButton from '../../components/common/ListenButton';
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
  const isEn = i18n.language === 'en';
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
  const [aiDrafting, setAiDrafting] = useState(false);
  const [aiChecklist, setAiChecklist] = useState([]);

  const handleAiDraft = async () => {
    setAiDrafting(true);
    try {
      const res = await aiApi.generateGrievance({
        farmerName: farmerName || 'Kisan',
        category,
        description: description.trim() || undefined,
        language: isEn ? 'en' : 'hi',
      });
      if (res?.data) {
        const bodyText = res.data.body || res.data.responseText;
        if (bodyText) {
          setDescription(bodyText);
          setErrorDesc('');
        }
        if (Array.isArray(res.data.evidenceChecklist) && res.data.evidenceChecklist.length > 0) {
          setAiChecklist(res.data.evidenceChecklist);
        }
        toast.success(isEn ? 'AI Grievance drafted! Review and edit before submitting.' : 'एआई द्वारा प्रारूप तैयार किया गया! कृपया जांचें और जमा करें।');
      }
    } catch {
      toast.error(isEn ? 'AI drafting temporarily unavailable' : 'एआई सेवा से संपर्क नहीं हो सका');
    } finally {
      setAiDrafting(false);
    }
  };

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
    setAiChecklist([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmittedGrievance(null);
    setAiChecklist([]);
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

  const downloadPdfReceipt = async (item) => {
    const g = item || submittedGrievance;
    if (!g) return;

    if (g.id && typeof g.id === 'number') {
      try {
        await downloadGrievancePdf(g.id, `KisanSetu-Grievance-${g.id}.pdf`);
        toast.success(t('grievance.pdfDownloaded', 'PDF Receipt downloaded'));
        return;
      } catch (err) {
        // Fall back to client generation if server stream has error
      }
    }

    const doc = new jsPDF();

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
    doc.text(`Applicant ID: ${g.farmerId} (${farmerName || ''})`, 18, 66);
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
      { id: 'OPEN', label: isEn ? 'Submitted' : 'दर्ज' },
      { id: 'IN_REVIEW', label: isEn ? 'In Review' : 'समीक्षा में' },
      { id: 'RESOLVED', label: isEn ? 'Resolved' : 'समाधान' },
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
        eyebrow={isEn ? 'Public Grievance Redressal' : 'सार्वजनिक शिकायत निवारण'}
        title={isEn ? 'Farmer Grievance Center' : 'शिकायत निवारण केंद्र'}
        subtitle={isEn
          ? 'Register, track status, and obtain digital acknowledgment slips for revenue & bank disputes.'
          : 'राजस्व व बैंक विवादों के लिए पंजीकरण, स्थिति ट्रैक और डिजिटल पावती पर्ची प्राप्त करें।'}
        actions={
          <div className="flex items-center gap-2">
            <ListenButton
              text={isEn
                ? `Farmer Grievance Redressal Center. You have ${list.length} registered grievances. Click File New Grievance to report discrepancies in land records, missing subsidies, or loan issues.`
                : `किसान शिकायत निवारण केंद्र। आपके कुल ${list.length} शिकायतें दर्ज हैं। खतौनी, सब्सिडी अथवा ऋण विसंगतियों के समाधान हेतु नई शिकायत दर्ज करें।`
              }
              title={isEn ? 'Grievance Overview' : 'शिकायत केंद्र विवरण'}
            />
            <Button
              variant="primary"
              onClick={handleOpenModal}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              {isEn ? '+ File New Grievance' : '+ नई शिकायत दर्ज करें'}
            </Button>
          </div>
        }
      />

      {/* Submission Modal (M3.5, M5.1) */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          submittedGrievance
            ? (isEn ? 'Grievance Acknowledged' : 'शिकायत पावती रसीद')
            : (isEn ? 'File Formal Grievance' : 'औपचारिक शिकायत दर्ज करें')
        }
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
                {isEn ? 'Acknowledgment Reference Number' : 'शिकायत संदर्भ संख्या'}
              </span>
              <div className="text-xl sm:text-2xl font-bold font-serif text-indigo-900 mt-1 select-all tabular-nums">
                {submittedGrievance.referenceNumber}
              </div>
              <p className="text-xs text-ink-muted mt-2">
                {isEn
                  ? 'Your complaint has been submitted to the Lead Bank Officer and Talathi revenue desk.'
                  : 'आपकी शिकायत लीड बैंक अधिकारी एवं तलाठी राजस्व डेस्क को अग्रेषित कर दी गई है।'}
              </p>
            </div>

            <div className="pt-3 border-t border-paper-200 flex flex-wrap gap-2 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => downloadPdfReceipt(submittedGrievance)}
                icon={<Download className="w-4 h-4" />}
              >
                {isEn ? 'Download PDF Receipt' : 'पीडीएफ रसीद डाउनलोड करें'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyReference(submittedGrievance.referenceNumber)}
                icon={<Copy className="w-4 h-4" />}
              >
                {isEn ? 'Copy Ref' : 'संदर्भ कॉपी करें'}
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
              label={isEn ? 'Issue Category' : 'समस्या की श्रेणी'}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={GRIEVANCE_CATEGORIES.map((c) => ({
                value: c.value,
                label: isEn
                  ? c.value.replace(/_/g, ' ')
                  : (c.value === 'WRONG_LAND_RECORD'
                      ? 'ज़मीन / खतौनी में गलत प्रविष्टि'
                      : c.value === 'ENTITLEMENT_NOT_RECEIVED'
                      ? 'योजना का हक या सब्सिडी नहीं मिली'
                      : c.value === 'LOAN_DISCREPANCY'
                      ? 'ऋण बकाया या गलत एनपीए स्थिति'
                      : 'अन्य शिकायत'),
              }))}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold font-serif text-indigo-950">
                  {isEn ? 'Detailed Complaint Description *' : 'विस्तृत विवरण *'}
                </span>
                <div className="flex items-center gap-2">
                  {description.trim().length > 0 && (
                    <ListenButton
                      text={description}
                      title={isEn ? 'Grievance Draft' : 'शिकायत प्रारूप'}
                      size="sm"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleAiDraft}
                    disabled={aiDrafting}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono px-2 py-1 bg-saffron-100 hover:bg-saffron-200 text-indigo-950 border border-saffron-400 rounded-xs transition-colors shadow-hard-sm"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-saffron-600 ${aiDrafting ? 'animate-spin' : ''}`} />
                    <span>{aiDrafting ? (isEn ? 'AI Drafting...' : 'एआई प्रारूप तैयार हो रहा...') : (isEn ? 'Draft with AI' : 'एआई से ड्राफ्ट करें')}</span>
                  </button>
                </div>
              </div>
              <Field
                id="grv-desc"
                type="textarea"
                label=""
                required
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value.trim().length >= 20) {
                    setErrorDesc('');
                  }
                }}
                error={errorDesc}
                placeholder={isEn
                  ? 'Explain the discrepancy in detail (minimum 20 characters required)...'
                  : 'अपनी समस्या का पूरा विवरण लिखें (कम से कम 20 अक्षर आवश्यक)...'}
                rows={5}
                hint={`${description.length} / 1000 (${isEn ? 'min 20 characters' : 'कम से कम 20 अक्षर आवश्यक'})`}
                maxLength={1000}
              />

              {aiChecklist.length > 0 && (
                <div className="mt-2.5 p-2.5 bg-paper-100 border border-sage-400 rounded-xs text-xs space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-sage-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                    <span>{isEn ? 'Suggested Supporting Documents (AI Checklist):' : 'सुझाए गए आवश्यक साक्ष्य दस्तावेज:'}</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-ink-muted pl-1 space-y-0.5">
                    {aiChecklist.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-paper-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                {isEn ? 'Cancel' : 'रद्द करें'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={submitting || description.trim().length < 20}
              >
                {isEn ? 'Submit Grievance' : 'शिकायत जमा करें'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* History Ledger List with stagger fade-up (max 8) (M3.5) */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase font-bold tracking-wider text-clay-500">
          {isEn ? 'Registered Grievance Redressal Audit Trail' : 'दर्ज शिकायतों का इतिहास व ऑडिट ट्रेल'}
        </h2>

        {loading ? (
          <div className="space-y-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : error ? (
          <ErrorState
            title={isEn ? 'Unable to load grievance history' : 'शिकायत इतिहास लोड करने में असमर्थ'}
            onRetry={retry}
          />
        ) : list.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-paper-200 rounded-sm bg-paper-50 p-6 animate-fade-in">
            <p className="text-sm text-ink-muted">
              {isEn ? 'No complaints or grievances have been filed yet.' : 'अब तक कोई शिकायत दर्ज नहीं की गई है।'}
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
                      {isEn
                        ? item.category.replace(/_/g, ' ')
                        : (item.category === 'WRONG_LAND_RECORD'
                            ? 'ज़मीन / खतौनी में गलत प्रविष्टि'
                            : item.category === 'ENTITLEMENT_NOT_RECEIVED'
                            ? 'योजना का हक या सब्सिडी नहीं मिली'
                            : item.category === 'LOAN_DISCREPANCY'
                            ? 'ऋण बकाया या गलत एनपीए स्थिति'
                            : 'अन्य शिकायत')}
                    </p>

                    <p className="text-sm text-indigo-900 max-w-2xl leading-relaxed">
                      {isEn
                        ? item.description
                        : (item.descriptionHi || (item.description?.includes('father')
                            ? 'सर्वे 102/1 में भूलेखा ऑनलाइन प्रविष्टि में मेरे पिता का उपनाम छूट गया था, जिससे स्वचालित अलर्ट उत्पन्न हुआ।'
                            : item.description?.includes('PMFBY')
                            ? 'मेरठ क्षेत्र के लिए स्वीकृत पीएमएफबीवाई मौसम मुआवजा राशि मेरे पीएनबी खाते में जमा नहीं हुई है।'
                            : item.description))}
                    </p>

                    {/* Stepper progress */}
                    {renderStatusStepper(item.status)}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <ListenButton
                      text={`${isEn ? 'Reference Number' : 'संदर्भ संख्या'}: ${item.referenceNumber}. ${isEn ? 'Status' : 'स्थिति'}: ${item.status}. ${item.description}`}
                      title={item.referenceNumber}
                      size="sm"
                    />

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyReference(item.referenceNumber)}
                      icon={<Copy className="w-3.5 h-3.5" />}
                    >
                      {isEn ? 'Copy Ref' : 'संदर्भ कॉपी करें'}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadPdfReceipt(item)}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      {isEn ? 'PDF' : 'पीडीएफ'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          CITIZEN REDRESSAL CHARTER & 3-TIER ESCALATION MATRIX
          Statutory service level agreements under Public Grievance Charter
          ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-paper-200 pb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 font-mono block">
              {isEn ? 'Citizen Charter SLA' : 'नागरिक अधिकार चार्टर (Citizen Charter SLA)'}
            </span>
            <h3 className="font-serif font-bold text-lg text-indigo-950">
              {isEn ? '3-Tier Public Grievance Redressal & Resolution Timelines' : 'त्रि-स्तरीय जन शिकायत निवारण व कानूनी समाधान समयसीमा'}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2.5 py-1 border border-sage-600 rounded-xs">
            {isEn ? 'Max 48-Hour SLA' : 'अधिकतम 48 घंटे SLA'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tier 1 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-clay-100 text-clay-700 border border-clay-600 rounded-xs">
                  {isEn ? 'Tier 1 • Primary Level' : 'स्तर 1 • प्राथमिक स्तर'}
                </span>
                <span className="text-xs font-bold text-indigo-900 font-mono">
                  {isEn ? '48 Hours' : '48 घंटे'}
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-indigo-950">
                {isEn ? 'Talathi & Revenue Lekhpal Desk' : 'राजस्व लेखपाल व ई-चावड़ी डेस्क'}
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? 'Verification and correction of 7/12 spelling errors, khasra area rectifications, and digital mutation acknowledgments.'
                  : '7/12 खतौनी में नाम की वर्तनी (Spelling), खसरा रकबा त्रुटि एवं डिजिटल म्यूटेशन सुधार की पावती व सत्यापन।'
                }
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-paper-200 text-[11px] font-semibold text-sage-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>{isEn ? 'Digitally signed order issuance' : 'डिजिटल हस्ताक्षर युक्त आदेश जारी'}</span>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-saffron-100 text-saffron-800 border border-saffron-600 rounded-xs">
                  {isEn ? 'Tier 2 • Nodal Bank Branch' : 'स्तर 2 • नोडल बैंक शाखा'}
                </span>
                <span className="text-xs font-bold text-indigo-900 font-mono">
                  {isEn ? '7 Working Days' : '7 कार्यदिवस'}
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-indigo-950">
                {isEn ? 'Lead District Bank Manager (LDM)' : 'अग्रणी जिला बैंक प्रबंधक (LDM)'}
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? 'Hearings on KCC interest subvention (3% PRI), DBT Aadhaar seeding mismatches, and OTS restructuring for NPA accounts.'
                  : 'KCC ब्याज अनुदान (3% PRI), DBT आधार सीडिंग विसंगति एवं गैर-निष्पादित (NPA) खातों के एकमुश्त पुनर्गठन की सुनवाई।'
                }
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-paper-200 text-[11px] font-semibold text-clay-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-clay-600 shrink-0" />
              <span>{isEn ? 'Special branch resolution camps' : 'शाखा स्तर पर विशेष निवारण शिविर'}</span>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-rust-100 text-rust-700 border border-rust-600 rounded-xs">
                  {isEn ? 'Tier 3 • Appellate Authority' : 'स्तर 3 • अपीलीय प्राधिकरण'}
                </span>
                <span className="text-xs font-bold text-indigo-900 font-mono">
                  {isEn ? '15 Working Days' : '15 कार्यदिवस'}
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-indigo-950">
                {isEn ? 'Sub-Divisional Magistrate (SDM) & Banking Ombudsman' : 'उप-जिलाधिकारी (SDM) व बैंकिंग लोकपाल'}
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                {isEn
                  ? 'Statutory appeals under Section 155 in case of unsatisfactory resolution by Tehsildar, and RBI Banking Ombudsman cognizance.'
                  : 'तहसीलदार स्तर पर असंतोषजनक समाधान की दशा में धारा 155 अंतर्गत वैधानिक अपील एवं RBI लोकपाल संज्ञान।'
                }
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-paper-200 text-[11px] font-semibold text-indigo-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-900 shrink-0" />
              <span>{isEn ? 'Final statutory binding order' : 'अंतिम वैधानिक अधिनिर्णय (Binding Order)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          WARDHA DISTRICT NODAL GRIEVANCE OFFICERS DIRECTORY
          ========================================================================= */}
      <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-5 sm:p-6 shadow-hard-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-paper-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 block font-mono">
              {isEn ? 'Wardha District Grievance Redressal Cell' : 'वर्धा जिला कृषि व राजस्व निवारण प्रकोष्ठ'}
            </span>
            <h3 className="font-serif font-bold text-lg text-indigo-950">
              {isEn ? 'Authorized Grievance Redressal Officers & Support Contacts' : 'अधिकृत शिकायत निवारण अधिकारी व सहायता संपर्क'}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 bg-paper-100 px-3 py-1.5 border border-indigo-900 rounded-xs">
            <PhoneCall className="w-3.5 h-3.5 text-clay-600 shrink-0" />
            <span>
              {isEn ? 'HQ Helpline: 07152-240112' : 'मुख्यालय हेल्पलाइन: 07152-240112'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-paper-100 rounded-sm border border-paper-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">
                {isEn ? 'Shri Rahul Wankhede' : 'श्री राहुल वानखेड़े'}
              </span>
              <span className="text-[10px] font-mono font-bold text-clay-600 bg-paper-50 px-1.5 py-0.5 border border-paper-200">
                {isEn ? 'Revenue Dispute' : 'राजस्व वाद'}
              </span>
            </div>
            <div className="text-xs text-ink-muted font-medium">
              {isEn ? 'Naib Tehsildar, Wardha Tehsil' : 'नायब तहसीलदार, वर्धा तहसील'}
            </div>
            <div className="text-[11px] text-ink-muted leading-tight">
              {isEn ? 'Room 14, Tehsil Complex • Email: sdm.wardha@maharashtra.gov.in' : 'कक्ष संख्या: 14, तहसील कार्यालय परिसर • ईमेल: sdm.wardha@maharashtra.gov.in'}
            </div>
            <div className="text-[11px] text-sage-800 font-semibold pt-1">
              {isEn ? '✓ Land discrepancy & mutation hearing: Every Tuesday' : '✓ भूमि विसंगति व म्यूटेशन सुनवाई: प्रत्येक मंगलवार'}
            </div>
          </div>

          <div className="p-3.5 bg-paper-100 rounded-sm border border-paper-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">
                {isEn ? 'Smt. Sunita Deshmukh' : 'श्रीमती सुनीता देशमुख'}
              </span>
              <span className="text-[10px] font-mono font-bold text-clay-600 bg-paper-50 px-1.5 py-0.5 border border-paper-200">
                {isEn ? 'Lead Bank' : 'अग्रणी बैंक'}
              </span>
            </div>
            <div className="text-xs text-ink-muted font-medium">
              {isEn ? 'Lead District Manager (LDM), Bank of Maharashtra' : 'अग्रणी जिला प्रबंधक (LDM), बैंक ऑफ महाराष्ट्र'}
            </div>
            <div className="text-[11px] text-ink-muted leading-tight">
              {isEn ? 'LDM Office, Civil Lines, Wardha • Phone: 07152-245123' : 'एलडीएम कार्यालय, सिविल लाइंस, वर्धा • फोन: 07152-245123'}
            </div>
            <div className="text-[11px] text-sage-800 font-semibold pt-1">
              {isEn ? '✓ KCC loan & DBT subsidy helpdesk' : '✓ KCC ऋण व DBT सब्सिडी समाधान हेल्पडेस्क'}
            </div>
          </div>

          <div className="p-3.5 bg-paper-100 rounded-sm border border-paper-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-sm">
                {isEn ? 'Shri Vilas Sawarkar' : 'श्री विलास सावरकर'}
              </span>
              <span className="text-[10px] font-mono font-bold text-clay-600 bg-paper-50 px-1.5 py-0.5 border border-paper-200">
                {isEn ? 'PMFBY Desk' : 'PMFBY डेस्क'}
              </span>
            </div>
            <div className="text-xs text-ink-muted font-medium">
              {isEn ? 'Taluka Agriculture Officer (TAO), Wardha' : 'तालुका कृषि अधिकारी (TAO), वर्धा'}
            </div>
            <div className="text-[11px] text-ink-muted leading-tight">
              {isEn ? 'Krishi Bhavan, Sevagram Road, Wardha • Email: tao.wardha@gov.in' : 'कृषि भवन, सेवाग्राम रोड, वर्धा • ईमेल: tao.wardha@gov.in'}
            </div>
            <div className="text-[11px] text-sage-800 font-semibold pt-1">
              {isEn ? '✓ Crop loss satellite survey & claim settlement' : '✓ फसल क्षति उपग्रह सर्वेक्षण व बीमा दावा निपटान'}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL DOWNLOADS & CENTRAL PORTAL ESCALATION
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-paper-100 border border-indigo-900 rounded-sm p-4 shadow-hard-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-clay-100 border border-clay-600 text-clay-700 flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-indigo-950">
                {isEn ? 'Form-6: Offline Grievance Application Form' : 'प्रपत्र-6: ऑफलाइन शिकायत आवेदन पत्र'}
              </h4>
              <p className="text-xs text-ink-muted">
                {isEn ? 'Official PDF format for physical submission at the Tehsildar office' : 'तहसीलदार कार्यालय में प्रत्यक्ष जमा हेतु अधिकृत पीडीएफ प्रारूप'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const doc = new jsPDF();
              doc.setFontSize(16);
              doc.text('PRA PATRA 6 - REVENUE GRIEVANCE FORM', 20, 20);
              doc.setFontSize(11);
              doc.text('District: Wardha | Tehsil: Wardha | Maharashtra', 20, 30);
              doc.text('To: The Tahsildar / Talathi Officer', 20, 45);
              doc.text('Subject: Application for Correction in 7/12 Bhulekh & KCC Record', 20, 55);
              doc.text(`Farmer Name: ${farmerName || ''}`, 20, 70);
              doc.text('Survey Number: 102/1 | Area: 2.5 Hectares', 20, 80);
              doc.text('Nature of Discrepancy: Surname spelling omission in online portal', 20, 90);
              doc.text('Date of Filing: 15 Feb 2026', 20, 105);
              doc.text('Signature of Applicant: _____________________', 20, 130);
              doc.save('KisanSetu-Form6-Revenue-Grievance.pdf');
            }}
            className="px-3 py-1.5 bg-paper-50 hover:bg-paper-200 border border-indigo-900 rounded-sm text-xs font-bold text-indigo-950 flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isEn ? 'Download' : 'डाउनलोड'}</span>
          </button>
        </div>

        <div className="bg-paper-100 border border-indigo-900 rounded-sm p-4 shadow-hard-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-sage-100 border border-sage-600 text-sage-800 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-indigo-950">
                {isEn ? 'Central CPGRAMS Public Grievance Portal' : 'केंद्रीय CPGRAMS लोक शिकायत पोर्टल'}
              </h4>
              <p className="text-xs text-ink-muted">
                {isEn ? 'Govt. of India central platform for direct escalation to Ministry' : 'मंत्रालय स्तर पर सीधे समाधान हेतु भारत सरकार का केंद्रीय मंच'}
              </p>
            </div>
          </div>
          <a
            href="https://pgportal.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-paper-50 hover:bg-paper-200 border border-indigo-900 rounded-sm text-xs font-bold text-indigo-950 flex items-center gap-1.5 shrink-0"
          >
            <span>{isEn ? 'Open Portal' : 'पोर्टल खोलें'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* =========================================================================
          FREQUENTLY ASKED QUESTIONS (FAQ)
          ========================================================================= */}
      <div className="bg-paper-50 border border-indigo-900 rounded-sm p-5 shadow-hard-sm space-y-3">
        <div className="flex items-center gap-2 text-clay-700">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <h4 className="font-serif font-bold text-base text-indigo-950">
            {isEn ? 'Frequently Asked Questions (FAQ)' : 'शिकायत निवारण संबंधी अक्सर पूछे जाने वाले प्रश्न (FAQ)'}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
            <span className="font-bold text-indigo-950 block">
              {isEn ? 'Q. How do I get an acknowledgment receipt after filing a grievance?' : 'प्र. शिकायत दर्ज करने के बाद पावती (Receipt) कैसे प्राप्त होगी?'}
            </span>
            <p className="text-ink-muted leading-relaxed">
              {isEn
                ? 'Upon submission, a 14-digit KS-GRV reference number is generated instantly. You can download your official digital acknowledgment PDF by clicking the "PDF" button above.'
                : 'शिकायत सबमिट होते ही आपको 14 अंकों का KS-GRV संदर्भ क्रमांक मिलता है। आप ऊपर दिए गए "PDF" बटन पर क्लिक करके आधिकारिक डिजिटल पावती तुरंत डाउनलोड कर सकते हैं।'
              }
            </p>
          </div>
          <div className="p-3 bg-paper-100 rounded-xs border border-paper-200 space-y-1">
            <span className="font-bold text-indigo-950 block">
              {isEn ? 'Q. What happens if my issue is not resolved within the 48-hour SLA?' : 'प्र. यदि निर्धारित 48 घंटे में समाधान न हो तो क्या करें?'}
            </span>
            <p className="text-ink-muted leading-relaxed">
              {isEn
                ? 'Once 48 hours lapse without resolution, the system automatically escalates the grievance to Tier 2 (Naib Tehsildar & Lead Bank Officer) and sends an SMS alert to the applicant.'
                : '48 घंटे पूर्ण होते ही सिस्टम स्वतः शिकायत को स्तर 2 (नायब तहसीलदार व LDM बैंक अधिकारी) पर एस्केलेट कर देता है और आवेदक को SMS अलर्ट प्रेषित किया जाता है।'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
