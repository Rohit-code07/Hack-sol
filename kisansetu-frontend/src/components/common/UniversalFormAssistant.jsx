import React, { useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Camera,
  Check,
  Globe,
  Info,
} from 'lucide-react';
import useUniversalFormAssistant from '../../hooks/useUniversalFormAssistant';

/**
 * UniversalFormAssistant Component.
 *
 * Integrates Voice-to-Form and Document-to-Form capabilities into ANY form.
 * Placed cleanly above or inside form containers without modifying form logic.
 *
 * @param {Object} props
 * @param {string} props.formId - Unique schema ID from formRegistry
 * @param {Object} [props.customSchema] - Optional custom schema
 * @param {Object} props.currentValues - Live parent form values
 * @param {Function} props.onApplyFields - (updatedFields) => void callback to parent
 * @param {string} [props.className] - Optional custom CSS class
 * @param {string} [props.variant='full'] - 'full' | 'compact' | 'minimal'
 */
export default function UniversalFormAssistant({
  formId,
  customSchema,
  currentValues = {},
  onApplyFields,
  className = '',
  variant = 'full',
}) {
  const {
    schema,
    language,
    setLanguage,
    isListening,
    speechTranscript,
    startListening,
    stopListening,
    handleProcessVoiceText,
    processDocument,
    isProcessing,
    processingSource,
    extractedData,
    conflicts,
    resolveConflict,
    applyExtractedFields,
    reviewOpen,
    closeReview,
    errorMessage,
    successMessage,
  } = useUniversalFormAssistant({
    formId,
    customSchema,
    currentValues,
    onApplyFields,
    defaultLanguage: 'hi',
  });

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Sync selected fields when new extractedData arrives
  React.useEffect(() => {
    if (extractedData?.extractedFields) {
      const initial = {};
      Object.entries(extractedData.extractedFields).forEach(([key, item]) => {
        // Pre-select high/medium confidence non-sensitive fields
        const shouldSelect =
          !item.requiresConfirmation && item.confidenceLevel !== 'LOW';
        initial[key] = shouldSelect;
      });
      setSelectedFields(initial);
    }
  }, [extractedData]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIsDocModalOpen(false);
      processDocument(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsDocModalOpen(false);
      processDocument(file);
    }
  };

  const handleApplySelected = () => {
    if (!extractedData?.extractedFields) return;
    const toApply = {};
    Object.entries(extractedData.extractedFields).forEach(([key, field]) => {
      if (selectedFields[key]) {
        toApply[key] = field.value;
      }
    });
    applyExtractedFields(toApply);
  };

  const toggleSelectAll = (selectAll) => {
    if (!extractedData?.extractedFields) return;
    const next = {};
    Object.keys(extractedData.extractedFields).forEach((key) => {
      next[key] = selectAll;
    });
    setSelectedFields(next);
  };

  const isHindi = language === 'hi';

  return (
    <div
      className={`relative rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 dark:from-emerald-950/30 dark:via-gray-900/40 dark:to-emerald-950/30 p-3.5 mb-6 shadow-sm transition-all ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Badge & Info */}
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wide uppercase text-emerald-800 dark:text-emerald-300">
                {isHindi ? 'स्मार्ट फ़ॉर्म सहायक' : 'Smart Form Assistant'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-paper-600 dark:text-gray-400">
              {isHindi
                ? 'बोलकर या दस्तावेज़ / रसीद की फ़ोटो अपलोड करके फ़ॉर्म स्वतः भरें'
                : 'Fill form instantly using natural speech or document upload'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(isHindi ? 'en' : 'hi')}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-paper-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-paper-700 dark:text-gray-300 transition-colors shadow-2xs"
            title={isHindi ? 'भाषा बदलें' : 'Switch Language'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHindi ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Voice Button */}
          {!isListening ? (
            <button
              type="button"
              onClick={startListening}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-xs disabled:opacity-50"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isHindi ? 'बोलकर भरें' : 'Voice Fill'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopListening}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white transition-all shadow-xs animate-pulse"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>{isHindi ? 'समाप्त करें' : 'Stop Listening'}</span>
            </button>
          )}

          {/* Document Upload Button */}
          <button
            type="button"
            onClick={() => setIsDocModalOpen(true)}
            disabled={isProcessing || isListening}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-95 transition-all shadow-xs disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHindi ? 'दस्तावेज़ अपलोड' : 'Upload Doc'}</span>
          </button>
        </div>
      </div>

      {/* Active Listening Wave & Live Transcript */}
      {isListening && (
        <div className="mt-3 p-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-emerald-300 dark:border-emerald-700/60 shadow-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="truncate text-xs font-medium text-paper-800 dark:text-gray-200">
              {speechTranscript ||
                (isHindi
                  ? 'सुन रहे हैं... कृपया स्पष्ट बोलें (जैसे: मेरा नाम रमेश है, खसरा नंबर 142/2)'
                  : 'Listening... please speak clearly (e.g. My name is Ramesh, Khasra 142/2)')}
            </div>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="shrink-0 px-2 py-1 text-[11px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isHindi ? 'डेटा निकालें' : 'Extract'}
          </button>
        </div>
      )}

      {/* Processing Loader */}
      {isProcessing && (
        <div className="mt-3 p-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-emerald-300 dark:border-emerald-700/60 shadow-xs flex items-center space-x-2.5 animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
            {processingSource === 'document'
              ? isHindi
                ? 'दस्तावेज़ का विश्लेषण एवं फ़ील्ड पहचान जारी है...'
                : 'Analyzing document and identifying matching form fields...'
              : isHindi
              ? 'आवाज़ से जानकारी निकाली जा रही है...'
              : 'Extracting structured details from your speech...'}
          </span>
        </div>
      )}

      {/* Status Messages */}
      {errorMessage && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && !reviewOpen && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* DOCUMENT UPLOAD MODAL */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-paper-200 dark:border-gray-800 p-6 animate-scale-up">
            <button
              type="button"
              onClick={() => setIsDocModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {isHindi ? 'दस्तावेज़ से फ़ॉर्म भरें' : 'Autofill from Document'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isHindi
                    ? 'खतौनी, आधार, बैंक पासबुक या ऋण रसीद अपलोड करें'
                    : 'Upload Khasra/Khatoni, Aadhaar, Bank Passbook, or Loan Receipt'}
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-paper-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-paper-50 dark:bg-gray-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />

              <UploadCloud className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {isHindi ? 'फ़ाइल यहाँ खींचें या ब्राउज़ करें' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPG, PNG, WEBP, or PDF (Max 10MB)
              </p>
            </div>

            {/* Camera Snap Option */}
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>{isHindi ? 'कैमरे से फ़ोटो लें' : 'Take Photo with Camera'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTRACTED FIELDS REVIEW & CONFLICT RESOLUTION MODAL */}
      {reviewOpen && extractedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-paper-200 dark:border-gray-800 animate-scale-up">
            {/* Header */}
            <div className="px-6 py-4 border-b border-paper-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {isHindi ? 'पहचाने गए फ़ील्ड की समीक्षा' : 'Review Extracted Fields'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {schema?.formTitle || 'Form'} •{' '}
                    {extractedData.source === 'voice'
                      ? isHindi
                        ? 'आवाज़ इनपुट'
                        : 'Voice Input'
                      : isHindi
                      ? 'दस्तावेज़ इनपुट'
                      : 'Document Input'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeReview}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Summary Banner */}
              {extractedData.summary && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-start space-x-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="font-semibold">{isHindi ? 'सारांश:' : 'AI Summary:'}</div>
                    <div>{extractedData.summary}</div>
                  </div>
                </div>
              )}

              {/* CONFLICT RESOLUTION SECTION */}
              {conflicts.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isHindi ? 'मान भिन्नता / टकराव मिला' : 'Field Conflicts Detected'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {isHindi
                      ? 'फ़ॉर्म में पहले से मौजूद मान और नए मान में अंतर है। कृपया चुनें कि कौन सा मान रखना है:'
                      : 'Existing form value differs from the extracted value. Select which value to use:'}
                  </p>

                  <div className="space-y-2.5">
                    {conflicts.map((conflict, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {conflict.fieldLabel || conflict.fieldName}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {conflict.reason}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => resolveConflict(conflict.fieldName, conflict.existingValue)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {isHindi ? 'मौजूदा रखें:' : 'Keep Current:'}{' '}
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {String(conflict.existingValue)}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveConflict(conflict.fieldName, conflict.extractedValue)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs transition-colors"
                          >
                            {isHindi ? 'नया चुनें:' : 'Use New:'}{' '}
                            <span className="font-semibold">
                              {String(conflict.extractedValue)}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Fields Table */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    {isHindi ? 'पहचाने गए फ़ील्ड्स' : 'Detected Form Fields'} (
                    {Object.keys(extractedData.extractedFields || {}).length})
                  </span>
                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(true)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      {isHindi ? 'सभी चुनें' : 'Select All'}
                    </button>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(false)}
                      className="text-gray-500 dark:text-gray-400 hover:underline"
                    >
                      {isHindi ? 'सभी हटाएं' : 'Deselect All'}
                    </button>
                  </div>
                </div>

                {Object.keys(extractedData.extractedFields || {}).length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400 border border-dashed rounded-xl">
                    {isHindi
                      ? 'कोई फ़ील्ड नहीं पहचाना जा सका। कृपया स्पष्ट बोलें या नया दस्तावेज़ अपलोड करें।'
                      : 'No fields could be extracted. Please speak clearly or try a clearer document.'}
                  </div>
                ) : (
                  <div className="space-y-2 border border-paper-200 dark:border-gray-800 rounded-xl divide-y divide-paper-100 dark:divide-gray-800/60 overflow-hidden">
                    {Object.entries(extractedData.extractedFields).map(([key, item]) => {
                      const schemaField = schema?.fields?.find((f) => f.name === key);
                      const fieldLabel =
                        isHindi && schemaField?.labelHi
                          ? schemaField.labelHi
                          : schemaField?.label || key;

                      const isConfidenceHigh = item.confidenceLevel === 'HIGH';
                      const isConfidenceMed = item.confidenceLevel === 'MEDIUM';

                      return (
                        <div
                          key={key}
                          className="p-3.5 flex items-start justify-between gap-3 bg-white dark:bg-gray-900 hover:bg-paper-50 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`field-chk-${key}`}
                              checked={!!selectedFields[key]}
                              onChange={(e) =>
                                setSelectedFields((prev) => ({
                                  ...prev,
                                  [key]: e.target.checked,
                                }))
                              }
                              className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                            />
                            <div>
                              <label
                                htmlFor={`field-chk-${key}`}
                                className="text-xs font-bold text-gray-900 dark:text-white cursor-pointer"
                              >
                                {fieldLabel}
                              </label>
                              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {String(item.displayValue ?? item.value)}
                              </div>
                              {item.sourceSnippet && (
                                <div className="text-[11px] text-gray-400 dark:text-gray-500 italic mt-0.5">
                                  {isHindi ? 'पहचान आधार: ' : 'From: "'}
                                  {item.sourceSnippet}"
                                </div>
                              )}
                              {item.requiresConfirmation && (
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center space-x-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>
                                    {isHindi
                                      ? 'संवेदनशील फ़ील्ड - कृपया मान की पुष्टि करें'
                                      : 'Sensitive field - please confirm value'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Confidence Pill */}
                          <div className="shrink-0 flex items-center space-x-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                isConfidenceHigh
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : isConfidenceMed
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}
                            >
                              {item.confidenceLevel || 'MED'} (
                              {Math.round((item.confidence || 0.8) * 100)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-paper-200 dark:border-gray-800 bg-paper-50 dark:bg-gray-800/50 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isHindi
                  ? 'चयनित फ़ील्ड आपके फ़ॉर्म में भर दिए जाएंगे। आप सबमिट करने से पहले कभी भी बदल सकते हैं।'
                  : 'Selected fields will fill the form. You can still edit them before manual submission.'}
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={closeReview}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-paper-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleApplySelected}
                  disabled={
                    Object.values(selectedFields).filter(Boolean).length === 0
                  }
                  className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-md disabled:opacity-40"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isHindi ? 'फ़ॉर्म में भरें' : 'Apply to Form'} (
                    {Object.values(selectedFields).filter(Boolean).length})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
