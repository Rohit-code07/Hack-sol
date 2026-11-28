import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Sparkles,
  Send,
  Trash2,
  Eye,
  RefreshCw,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  HelpCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import Stamp from '../../components/common/Stamp';
import ListenButton from '../../components/common/ListenButton';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import { formatDate, formatCurrency } from '../../utils/formatters';

import {
  uploadAndAnalyzeDocument,
  getFarmerDocuments,
  getDocumentDetails,
  askDocumentQuestion,
  deleteDocument,
} from '../../services/documentService';

const SAMPLE_DOCS = [
  {
    name: 'KCC_Loan_Sanction.pdf',
    label: 'KCC Sanction Letter',
    labelHi: 'केसीसी ऋण स्वीकृति पत्र',
    category: 'KCC_LOAN',
  },
  {
    name: 'Khasra_Khatauni_Wardha.png',
    label: '7/12 Land Record Extract',
    labelHi: '7/12 खसरा खतौनी उद्धरण',
    category: 'LAND_RECORD',
  },
  {
    name: 'PMFBY_Insurance_Policy.pdf',
    label: 'PMFBY Crop Insurance Slip',
    labelHi: 'पीएमएफबीवाई फसल बीमा पावती',
    category: 'PMFBY_INSURANCE',
  },
  {
    name: 'MSP_Wheat_Procurement.jpg',
    label: 'MSP Procurement Mandi Receipt',
    labelHi: 'एमएसपी गेहूं खरीद मंडी रसीद',
    category: 'MSP_PROCUREMENT',
  },
];

export default function DocumentIntelligencePage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { farmerId, farmerName } = useAuth();
  const toast = useToast();
  useDocumentTitle('documents.title', 'AI Document Intelligence');

  // File selection state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Q&A state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  // Fetch document history
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await getFarmerDocuments(farmerId);
      if (res && res.data) {
        setHistoryList(res.data);
      }
    } catch {
      // silently fallback
    } finally {
      setLoadingHistory(false);
    }
  }, [farmerId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle file selection
  const handleFileChange = (file) => {
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(isEn ? 'File size must be under 10MB' : 'फ़ाइल का आकार 10MB से कम होना चाहिए');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error(isEn ? 'Please upload a PDF, JPG, PNG, or WEBP document' : 'कृपया केवल PDF, JPG, PNG अथवा WEBP फ़ाइल अपलोड करें');
      return;
    }

    setSelectedFile(file);
    setAnalysisError(null);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Upload and analyze
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setUploadProgress(10);
    setAnalysisStage(isEn ? 'Uploading document...' : 'दस्तावेज़ अपलोड किया जा रहा है...');
    setAnalysisError(null);
    setQaHistory([]);

    try {
      const timer1 = setTimeout(() => {
        setUploadProgress(40);
        setAnalysisStage(isEn ? 'Performing OCR text extraction...' : 'दस्तावेज़ का पाठ निकाला जा रहा है...');
      }, 1500);

      const timer2 = setTimeout(() => {
        setUploadProgress(75);
        setAnalysisStage(isEn ? 'Analyzing anomalies & verifying against KisanSetu policy rules...' : 'नियमों के आधार पर विसंगति व वैधता की एआई जांच...');
      }, 3500);

      const res = await uploadAndAnalyzeDocument(
        selectedFile,
        isEn ? 'en' : 'hi',
        farmerId,
        (progress) => {
          if (progress < 90) setUploadProgress(progress);
        }
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
      setUploadProgress(100);

      if (res && res.data) {
        setAnalysisResult(res.data);
        toast.success(isEn ? 'Document analysis completed successfully!' : 'दस्तावेज़ का एआई विश्लेषण पूर्ण हुआ!');
        loadHistory();
      } else {
        throw new Error('Analysis response missing data');
      }
    } catch (err) {
      setAnalysisError(
        isEn
          ? 'Unable to complete document analysis. Please ensure the document is clear and try again.'
          : 'दस्तावेज़ विश्लेषण पूर्ण नहीं हो सका। कृपया स्पष्ट छवि अपलोड कर पुनः प्रयास करें।'
      );
      toast.error(isEn ? 'Document analysis failed' : 'दस्तावेज़ विश्लेषण विफल');
    } finally {
      setAnalyzing(false);
    }
  };

  // Ask question about document
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    const query = question.trim();
    if (!query || !analysisResult || asking) return;

    const userEntry = { sender: 'user', text: query, time: new Date() };
    setQaHistory((prev) => [...prev, userEntry]);
    setQuestion('');
    setAsking(true);

    try {
      const docId = analysisResult.documentId;
      const res = await askDocumentQuestion(docId, query, isEn ? 'en' : 'hi');
      if (res && res.data) {
        const botEntry = {
          sender: 'ai',
          text: res.data.answer,
          confidence: res.data.confidence,
          references: res.data.relevantSections || [],
          time: new Date(),
        };
        setQaHistory((prev) => [...prev, botEntry]);
      }
    } catch {
      setQaHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: isEn
            ? 'Unable to process question at this time. Please try again.'
            : 'वर्तमान में इस प्रश्न का उत्तर देने में असमर्थ। कृपया पुनः प्रयास करें।',
          time: new Date(),
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  // View historical document
  const handleViewHistoricalDoc = async (item) => {
    try {
      const res = await getDocumentDetails(item.id);
      if (res && res.data) {
        setAnalysisResult(res.data);
        setSelectedFile(null);
        setFilePreview(null);
        setQaHistory([]);
        window.scrollTo({ top: 400, behavior: 'smooth' });
        toast.success(isEn ? `Loaded ${item.originalFilename}` : `${item.originalFilename} का विश्लेषण खोला गया`);
      }
    } catch {
      toast.error(isEn ? 'Could not load document details' : 'दस्तावेज़ विवरण लोड नहीं हो सका');
    }
  };

  // Delete document
  const handleDeleteDoc = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm(isEn ? 'Delete this document and its analysis?' : 'क्या आप इस दस्तावेज़ और इसके विश्लेषण को हटाना चाहते हैं?')) {
      return;
    }
    try {
      await deleteDocument(docId);
      toast.success(isEn ? 'Document removed' : 'दस्तावेज़ हटा दिया गया');
      if (analysisResult?.documentId === docId) {
        setAnalysisResult(null);
      }
      loadHistory();
    } catch {
      toast.error(isEn ? 'Failed to delete document' : 'दस्तावेज़ हटाने में विफल');
    }
  };

  // Category label helper
  const getCategoryLabel = (category) => {
    const labels = {
      KCC_LOAN: { en: 'KCC Loan Agreement / Sanction', hi: 'केसीसी ऋण स्वीकृति / अनुबंध पत्र' },
      LAND_RECORD: { en: 'Land Record (7/12 / Khasra / Khatauni)', hi: 'भूलेख अभिलेख (7/12 खसरा खतौनी)' },
      PMFBY_INSURANCE: { en: 'PMFBY Crop Insurance Policy', hi: 'पीएमएफबीवाई फसल बीमा पावती' },
      MSP_PROCUREMENT: { en: 'MSP Procurement Mandi Receipt', hi: 'एमएसपी उपज खरीद मंडी रसीद' },
      BANK_RECEIPT: { en: 'Bank Loan Repayment Receipt', hi: 'बैंक ऋण भुगतान रसीद' },
      SUBSIDY_CERTIFICATE: { en: 'Agricultural Subsidy Certificate', hi: 'कृषि सब्सिडी स्वीकृति प्रमाण' },
      IDENTITY_CARD: { en: 'Farmer Identity / Aadhaar Card', hi: 'किसान पहचान / आधार कार्ड' },
      OTHER: { en: 'General Agricultural Document', hi: 'सामान्य कृषि दस्तावेज़' },
    };
    const c = labels[category] || labels.OTHER;
    return isEn ? c.en : c.hi;
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-rust-100 text-rust-700 border border-rust-500 rounded-xs"><AlertOctagon className="w-3 h-3" /> {isEn ? 'CRITICAL' : 'गंभीर'}</span>;
      case 'WARNING':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-saffron-100 text-indigo-950 border border-saffron-500 rounded-xs"><AlertTriangle className="w-3 h-3 text-saffron-600" /> {isEn ? 'WARNING' : 'चेतावनी'}</span>;
      case 'INFORMATIONAL':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-sage-100 text-sage-800 border border-sage-500 rounded-xs"><Info className="w-3 h-3 text-sage-600" /> {isEn ? 'INFO' : 'सूचना'}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-paper-200 text-ink-muted border border-paper-300 rounded-xs">{severity}</span>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      <PageHeader
        eyebrow={isEn ? 'Document Intelligence & Verification' : 'कृषि दस्तावेज़ बुद्धिमत्ता व सत्यापन'}
        title={isEn ? 'AI Document Scanner & Analysis' : 'एआई दस्तावेज़ स्कैनर व विश्लेषण'}
        subtitle={isEn
          ? 'Upload photos, scanned receipts, KCC letters, land records, or insurance policies for instant discrepancy detection and plain-language explanation.'
          : 'केसीसी ऋण पत्र, 7/12 खतौनी, बीमा पावती व मंडी रसीदें अपलोड कर तत्काल विसंगतियों की जांच व सरल भाषा में मार्गदर्शन प्राप्त करें।'}
        actions={
          <ListenButton
            text={isEn
              ? 'AI Document Scanner and Analysis. Upload your agricultural loans, land records, or insurance documents to automatically identify missing stamps, calculate interest anomalies, and get step-by-step guidance.'
              : 'एआई दस्तावेज़ स्कैनर व विश्लेषण। अपने कृषि ऋण, भूलेख अथवा बीमा पावती अपलोड करें और स्वचालित रूप से हस्ताक्षर, ब्याज विसंगतियों व आवश्यक सुधारों का मार्गदर्शन प्राप्त करें।'
            }
            title={isEn ? 'Document Scanner Overview' : 'दस्तावेज़ स्कैनर विवरण'}
          />
        }
      />

      {/* =========================================================================
          SECTION 1: DOCUMENT UPLOAD & CAMERA CAPTURE ZONE
          ========================================================================= */}
      <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-serif font-bold text-indigo-950 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-clay-600" />
              <span>{isEn ? 'Upload or Snap Document' : 'दस्तावेज़ अपलोड अथवा फोटो खींचें'}</span>
            </h2>
            <p className="text-xs text-ink-muted">
              {isEn
                ? 'Supports PDF, JPG, PNG, WEBP files up to 10MB. Clear text improves extraction accuracy.'
                : 'PDF, JPG, PNG, WEBP (अधिकतम 10MB)। स्पष्ट तस्वीर से सटीक परिणाम प्राप्त होते हैं।'}
            </p>
          </div>

          {/* Quick Demo Sample Picker */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-ink-muted hidden sm:inline">
              {isEn ? 'Sample Docs:' : 'नमूना:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_DOCS.slice(0, 2).map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const blob = new Blob(
                      [
                        `KisanSetu Sample Document: ${s.name}\nBeneficiary: ${farmerName || 'Ramesh D. Sharma'}\nDocument Type: ${s.category}\nSurvey No: 102/1\nAmount: Rs 1,85,000\nBank: Punjab National Bank Wardha\nDate: 12-08-2024\nStatus: Pending Renewal`
                      ],
                      { type: 'text/plain' }
                    );
                    const file = new File([blob], s.name, { type: 'application/pdf' });
                    handleFileChange(file);
                  }}
                  className="text-[10px] font-mono px-2 py-1 bg-paper-100 hover:bg-paper-200 text-indigo-900 border border-paper-300 rounded-xs transition-colors"
                >
                  {isEn ? s.label : s.labelHi}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drag and Drop Container */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-sm p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? 'border-clay-500 bg-saffron-50/50 scale-[1.01]'
                : 'border-paper-300 bg-paper-100/60 hover:bg-paper-100 hover:border-indigo-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="hidden"
              id="doc-file-input"
            />
            {/* Native Mobile Camera Capture */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="hidden"
              id="doc-camera-input"
            />

            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-paper-200 border border-indigo-900/20 flex items-center justify-center text-clay-600 shadow-hard-sm">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-indigo-950 font-serif">
                  {isEn ? 'Drag & drop your document here, or choose an option' : 'दस्तावेज़ यहाँ खींचकर छोड़ें, अथवा विकल्प चुनें'}
                </p>
                <p className="text-xs text-ink-muted">
                  {isEn ? 'PDF contracts, photos of passbook, mandi slips, or receipts' : 'पीडीएफ अनुबंध, पासबुक फोटो, मंडी पर्ची अथवा रसीद'}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-900 text-paper-50 rounded-xs font-bold text-xs shadow-hard-sm hover:bg-indigo-950 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isEn ? 'Browse Files' : 'फ़ाइल चुनें'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 bg-saffron-100 hover:bg-saffron-200 text-indigo-950 border border-saffron-400 rounded-xs font-bold text-xs shadow-hard-sm flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4 text-saffron-600" />
                  <span>{isEn ? 'Take Photo' : 'कैमरे से फोटो लें'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Selected File Preview Box */
          <div className="bg-paper-100 border border-indigo-900 rounded-sm p-4 sm:p-5 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                {filePreview ? (
                  <div className="relative w-16 h-16 rounded-xs overflow-hidden border border-indigo-900 bg-white shrink-0">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xs border border-indigo-900 bg-paper-200 flex flex-col items-center justify-center text-clay-600 shrink-0">
                    <FileText className="w-8 h-8" />
                    <span className="text-[9px] font-mono font-bold uppercase mt-0.5">PDF</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-950 font-serif break-all">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-paper-200 text-ink-muted rounded-xs">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <p className="text-xs text-sage-800 font-medium">
                    ✓ {isEn ? 'Ready for AI processing' : 'एआई विश्लेषण हेतु तैयार'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleClearFile}
                  disabled={analyzing}
                  className="px-3 py-1.5 text-xs font-medium text-rust-700 hover:bg-rust-50 border border-rust-300 rounded-xs flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Remove' : 'हटाएं'}</span>
                </button>

                <Button
                  variant="primary"
                  onClick={handleAnalyze}
                  loading={analyzing}
                  disabled={analyzing}
                  icon={<Sparkles className="w-4 h-4 text-saffron-400" />}
                >
                  {isEn ? 'Start AI Analysis' : 'एआई विश्लेषण शुरू करें'}
                </Button>
              </div>
            </div>

            {/* Analysis Progress Bar */}
            {analyzing && (
              <div className="pt-3 border-t border-paper-200 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-clay-600 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-saffron-500" />
                    {analysisStage}
                  </span>
                  <span className="font-mono font-bold text-indigo-900">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-paper-200 rounded-full overflow-hidden border border-paper-300">
                  <div
                    className="h-full bg-clay-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {analysisError && (
          <div className="p-3.5 bg-rust-50 border border-rust-400 text-rust-800 text-xs rounded-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rust-600 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: AI ANALYSIS RESULTS & DISCREPANCY AUDIT
          ========================================================================= */}
      {analysisResult && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Main Result Card */}
          <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard overflow-hidden">
            {/* Header Strip */}
            <div className="p-5 sm:p-6 bg-paper-100 border-b-2 border-indigo-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-clay-600 px-2 py-0.5 bg-paper-50 border border-clay-400 rounded-xs uppercase">
                    {analysisResult.category}
                  </span>
                  <span className="text-sm sm:text-base font-serif font-bold text-indigo-950">
                    {getCategoryLabel(analysisResult.category)}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  {isEn ? 'Ref ID' : 'संदर्भ आईडी'}: <span className="font-mono text-indigo-900 font-semibold">{analysisResult.documentId}</span> • {isEn ? 'Uploaded' : 'दिनांक'}: {formatDate(analysisResult.uploadDate || new Date(), i18n.language)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Quality Score Indicator */}
                {analysisResult.quality && (
                  <div className="px-3 py-1 bg-paper-50 border border-paper-300 rounded-xs flex items-center gap-2">
                    <span className="text-[11px] font-bold text-ink-muted uppercase">{isEn ? 'Readability' : 'पठनीयता'}:</span>
                    <span className="font-mono text-xs font-bold text-indigo-950">
                      {analysisResult.quality.readabilityScore || 90}%
                    </span>
                    <span className="text-[10px] text-sage-800 font-semibold">
                      ({analysisResult.quality.completenessStatus || (isEn ? 'Complete' : 'पूर्ण')})
                    </span>
                  </div>
                )}

                <ListenButton
                  text={`${getCategoryLabel(analysisResult.category)}. ${analysisResult.summary || analysisResult.purpose}. ${isEn ? 'Identified issues' : 'पहचानी गई विसंगतियां'}: ${analysisResult.issues?.length || 0}.`}
                  title={getCategoryLabel(analysisResult.category)}
                  size="sm"
                />
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* Plain-Language Explanation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clay-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-saffron-500" />
                    <span>{isEn ? 'What This Document Represents & Plain-Language Summary' : 'इस दस्तावेज़ का अर्थ व सरल व्याख्या'}</span>
                  </h3>
                  {analysisResult.summary && (
                    <ListenButton
                      text={analysisResult.summary}
                      title={isEn ? 'Document Summary' : 'दस्तावेज़ सारांश'}
                      size="sm"
                    />
                  )}
                </div>
                <div className="p-4 bg-paper-100 border border-paper-300 rounded-xs text-sm text-indigo-950 leading-relaxed font-sans">
                  {analysisResult.summary || analysisResult.purpose || (isEn ? 'Document successfully analyzed.' : 'दस्तावेज़ का सफलतापूर्वक विश्लेषण किया गया।')}
                </div>
              </div>

              {/* Extracted Key Information Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-clay-600 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-clay-600" />
                  <span>{isEn ? 'Extracted Information & Official Data Points' : 'निकाली गई मुख्य जानकारी व डेटा बिंदु'}</span>
                </h3>

                {Array.isArray(analysisResult.extractedFields) && analysisResult.extractedFields.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analysisResult.extractedFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-paper-100 border border-paper-200 rounded-xs space-y-1 hover:border-indigo-900/40 transition-colors"
                      >
                        <span className="text-[10px] font-mono uppercase font-bold text-ink-muted block">
                          {field.fieldName}
                        </span>
                        <div className="font-serif font-bold text-sm text-indigo-950">
                          {field.fieldValue || '—'}
                        </div>
                        {field.confidence && (
                          <div className="flex items-center gap-1 text-[10px] text-ink-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                            <span>{isEn ? 'Confidence' : 'सटीकता'}: {Math.round(field.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-muted italic">
                    {isEn ? 'No structured fields detected in this document format.' : 'इस दस्तावेज़ में कोई संरचित डेटा बिंदु नहीं मिला।'}
                  </p>
                )}
              </div>

              {/* Identified Discrepancies & Issues */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clay-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rust-600" />
                    <span>
                      {isEn ? 'Identified Discrepancies, Missing Info & Anomalies' : 'पहचानी गई विसंगतियां, त्रुटियां व लापता जानकारी'}
                    </span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-900">
                    {analysisResult.issues?.length || 0} {isEn ? 'flagged' : 'पहचाने गए'}
                  </span>
                </div>

                {Array.isArray(analysisResult.issues) && analysisResult.issues.length > 0 ? (
                  <div className="space-y-3">
                    {analysisResult.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border rounded-xs space-y-2.5 ${
                          issue.severity === 'CRITICAL'
                            ? 'bg-rust-50/70 border-rust-400'
                            : issue.severity === 'WARNING'
                            ? 'bg-saffron-50/70 border-saffron-400'
                            : 'bg-paper-100 border-paper-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(issue.severity)}
                            <span className="font-serif font-bold text-sm text-indigo-950">
                              {issue.title}
                            </span>
                          </div>

                          <ListenButton
                            text={`${issue.title}. ${issue.description}. ${isEn ? 'Resolution' : 'समाधान'}: ${issue.resolutionGuidance || ''}`}
                            title={issue.title}
                            size="sm"
                          />
                        </div>

                        <p className="text-xs text-indigo-900 leading-relaxed">
                          {issue.description}
                        </p>

                        {/* Supporting Evidence */}
                        {issue.evidence && (
                          <div className="p-2.5 bg-paper-50 border border-paper-200 rounded-xs text-[11px] text-ink-muted font-mono">
                            <span className="font-bold text-clay-700 block mb-0.5">
                              {isEn ? 'Supporting Evidence:' : 'प्रमाण / संदर्भ:'}
                            </span>
                            {issue.evidence}
                          </div>
                        )}

                        {/* Resolution & File Grievance CTA */}
                        {issue.resolutionGuidance && (
                          <div className="pt-2 border-t border-paper-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="text-sage-900 font-medium">
                              <span className="font-bold uppercase text-[10px] text-sage-800 block">
                                {isEn ? 'How to Resolve:' : 'सुझाया गया निवारण:'}
                              </span>
                              {issue.resolutionGuidance}
                            </div>

                            <Link
                              to={`/farmer/grievances?category=LOAN_DISCREPANCY&ref=${encodeURIComponent(
                                analysisResult.documentId
                              )}&desc=${encodeURIComponent(issue.title + ': ' + issue.description)}`}
                              className="shrink-0"
                            >
                              <button
                                type="button"
                                className="px-2.5 py-1 text-xs font-bold text-indigo-900 bg-paper-50 hover:bg-paper-200 border border-indigo-900 rounded-xs shadow-hard-xs flex items-center gap-1 transition-transform active:scale-95"
                              >
                                <span>{isEn ? 'File Grievance' : 'शिकायत दर्ज करें'}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-sage-50 border border-sage-300 rounded-xs text-xs text-sage-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                    <span>
                      {isEn
                        ? 'No critical discrepancies or errors were detected. Document appears in order.'
                        : 'कोई गंभीर विसंगति नहीं मिली। दस्तावेज़ नियमानुसार वैध प्रतीत होता है।'}
                    </span>
                  </div>
                )}
              </div>

              {/* Recommended Next Steps */}
              {Array.isArray(analysisResult.nextSteps) && analysisResult.nextSteps.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-paper-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clay-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                    <span>{isEn ? 'Recommended Next Steps for Farmer' : 'किसान के लिए अनुशंसित आगामी कदम'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {analysisResult.nextSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-paper-100 border border-paper-200 rounded-xs flex items-start gap-2.5 text-xs text-indigo-950"
                      >
                        <span className="w-5 h-5 rounded-full bg-clay-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: "ASK AI ABOUT THIS DOCUMENT" INTERACTIVE Q&A
              ========================================================================= */}
          <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-paper-200 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-serif font-bold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-saffron-500" />
                  <span>{isEn ? 'Ask AI About This Document' : 'इस दस्तावेज़ के संबंध में एआई से पूछें'}</span>
                </h3>
                <p className="text-xs text-ink-muted">
                  {isEn
                    ? 'Have questions about penalty clauses, due dates, subsidy rules, or next payments? Ask below.'
                    : 'ब्याज दर, अंतिम तिथि, सब्सिडी पात्रता अथवा किस्त से संबंधित कोई भी प्रश्न पूछें।'}
                </p>
              </div>

              <span className="text-[11px] font-mono text-clay-600 bg-paper-100 px-2 py-0.5 border border-paper-300 rounded-xs">
                {isEn ? 'Context: Active Document' : 'सक्रिय दस्तावेज़ संदर्भ'}
              </span>
            </div>

            {/* Q&A Chat Stream */}
            {qaHistory.length > 0 && (
              <div className="space-y-3 max-h-[360px] overflow-y-auto p-3 bg-paper-100/70 border border-paper-200 rounded-xs">
                {qaHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xs text-xs space-y-1.5 shadow-hard-xs ${
                        item.sender === 'user'
                          ? 'bg-indigo-900 text-paper-50'
                          : 'bg-paper-50 text-indigo-950 border border-indigo-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[10px] opacity-80">
                          {item.sender === 'user' ? (isEn ? 'You' : 'आप') : 'KisanSetu Document AI'}
                        </span>
                        {item.sender === 'ai' && (
                          <ListenButton text={item.text} title={isEn ? 'Answer' : 'उत्तर'} size="sm" />
                        )}
                      </div>
                      <p className="leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Quick Questions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-ink-muted self-center mr-1">
                {isEn ? 'Suggestions:' : 'सुझाव:'}
              </span>
              {[
                isEn ? 'What is the due date for payment?' : 'भुगतान की अंतिम तिथि क्या है?',
                isEn ? 'Are there any hidden penalties or extra fees?' : 'क्या कोई पेनल्टी अथवा अतिरिक्त शुल्क है?',
                isEn ? 'What should I do to claim subsidy on this?' : 'इस पर सब्सिडी प्राप्त करने हेतु क्या करें?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuestion(q)}
                  className="text-[11px] font-mono px-2 py-0.5 bg-paper-100 hover:bg-paper-200 text-indigo-900 border border-paper-300 rounded-xs transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Question Input Form */}
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  isEn
                    ? 'Type your question about this document...'
                    : 'इस दस्तावेज़ के बारे में अपना प्रश्न लिखें...'
                }
                disabled={asking}
                className="flex-1 px-3 py-2 text-xs bg-paper-50 border border-indigo-900 rounded-xs text-indigo-950 focus:outline-none focus:ring-2 focus:ring-saffron-400 placeholder:text-ink-muted"
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-paper-50 font-bold text-xs rounded-xs shadow-hard-xs flex items-center gap-1.5 disabled:opacity-50 transition-transform active:scale-95"
              >
                {asking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isEn ? 'Ask' : 'पूछें'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: UPLOADED DOCUMENT HISTORY LEDGER
          ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-paper-200">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-serif font-bold text-indigo-950">
              {isEn ? 'Uploaded Document History & Audit Ledger' : 'अपलोड किए गए दस्तावेज़ों का इतिहास व ऑडिट लेजर'}
            </h3>
            <p className="text-xs text-ink-muted">
              {isEn
                ? 'Previously scanned contracts and policies stored for quick re-verification.'
                : 'पूर्व में सत्यापित अनुबंध एवं रसीदें।'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            className="p-1.5 text-ink-muted hover:text-indigo-900 hover:bg-paper-200 rounded-xs transition-colors"
            title={isEn ? 'Refresh history' : 'इतिहास ताज़ा करें'}
          >
            <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingHistory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : historyList.length === 0 ? (
          <div className="p-8 text-center bg-paper-100/60 border border-dashed border-paper-300 rounded-sm text-xs text-ink-muted">
            {isEn
              ? 'No documents uploaded yet. Upload a loan receipt or land record above.'
              : 'अब तक कोई दस्तावेज़ अपलोड नहीं किया गया है। ऊपर नया दस्तावेज़ अपलोड करें।'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {historyList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewHistoricalDoc(item)}
                className={`p-4 bg-paper-50 border rounded-sm shadow-hard-xs hover:bg-paper-100/80 cursor-pointer transition-all ${
                  analysisResult?.documentId === item.id
                    ? 'border-clay-500 ring-2 ring-clay-400/40'
                    : 'border-indigo-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-clay-600 px-1.5 py-0.5 bg-paper-200 rounded-xs uppercase">
                      {item.category || 'DOCUMENT'}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-indigo-950 line-clamp-1">
                      {item.originalFilename}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteDoc(item.id, e)}
                    className="p-1 text-ink-muted hover:text-rust-700 transition-colors"
                    title={isEn ? 'Delete' : 'हटाएं'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-ink-muted line-clamp-2 mt-2 leading-relaxed">
                  {item.summary || (isEn ? 'Analysis available. Click to review.' : 'विश्लेषण उपलब्ध है। देखने हेतु क्लिक करें।')}
                </p>

                <div className="pt-3 mt-3 border-t border-paper-200 flex items-center justify-between text-[11px] text-ink-muted">
                  <span className="font-mono">{formatDate(item.uploadedAt, i18n.language)}</span>
                  <div className="flex items-center gap-1 text-indigo-950 font-bold hover:underline">
                    <span>{isEn ? 'View Analysis' : 'विश्लेषण देखें'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
