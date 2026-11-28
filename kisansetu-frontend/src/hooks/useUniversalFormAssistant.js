import { useState, useCallback, useRef, useEffect } from 'react';
import { getFormSchema } from '../schemas/formRegistry';
import formAssistantService from '../services/formAssistantService';

/**
 * Universal Hook to integrate voice and document AI form-filling into ANY form.
 *
 * @param {Object} options
 * @param {string} options.formId - Registered Form Schema ID or custom ID.
 * @param {Object} [options.customSchema] - Optional custom schema if not registered.
 * @param {Object} options.currentValues - Current form state values.
 * @param {Function} options.onApplyFields - Callback to update parent form: (fieldsToUpdate) => void.
 * @param {string} [options.defaultLanguage='hi'] - Default language ('hi' or 'en').
 */
export function useUniversalFormAssistant({
  formId,
  customSchema,
  currentValues = {},
  onApplyFields,
  defaultLanguage = 'hi',
}) {
  const schema = customSchema || getFormSchema(formId);
  const [language, setLanguage] = useState(defaultLanguage);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Processing & extraction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSource, setProcessingSource] = useState(null); // 'voice' | 'document'
  const [extractedData, setExtractedData] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  /**
   * Start microphone listening using browser Web Speech API.
   */
  const startListening = useCallback(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setSpeechTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ पहचान (Web Speech API) उपलब्ध नहीं है। कृपया क्रोम या एज का उपयोग करें।'
          : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      let accumulatedText = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSpeechTranscript(currentTranscript);
        accumulatedText = currentTranscript;
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(
            language === 'hi'
              ? `माइक्रोफ़ोन त्रुटि: ${event.error}`
              : `Microphone error: ${event.error}`
          );
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically trigger extraction if transcript exists
        if (accumulatedText && accumulatedText.trim().length > 2) {
          handleProcessVoiceText(accumulatedText.trim());
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage(
        language === 'hi'
          ? 'माइक्रोफ़ोन शुरू करने में समस्या आई।'
          : 'Failed to access microphone.'
      );
      setIsListening(false);
    }
  }, [language, schema, currentValues]);

  /**
   * Stop microphone recording and finalize extraction.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  /**
   * Send speech transcript to backend for field extraction.
   */
  const handleProcessVoiceText = useCallback(
    async (text) => {
      if (!text || text.trim().length < 2) return;

      setIsProcessing(true);
      setProcessingSource('voice');
      setErrorMessage('');

      try {
        const result = await formAssistantService.extractFromVoice({
          audioText: text,
          formSchema: schema,
          language,
          currentValues,
        });

        handleExtractionResult(result, 'voice');
      } catch (err) {
        console.error('Voice extraction error:', err);
        setErrorMessage(
          language === 'hi'
            ? 'आवाज़ से फ़ील्ड निकालने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Failed to extract form fields from voice. Please try again.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [schema, language, currentValues]
  );

  /**
   * Upload and process document (image or PDF).
   */
  const processDocument = useCallback(
    async (file) => {
      if (!file) return;

      setIsProcessing(true);
      setProcessingSource('document');
      setErrorMessage('');
      setSuccessMessage('');

      try {
        const result = await formAssistantService.extractFromDocument({
          file,
          formSchema: schema,
          currentValues,
          language,
        });

        handleExtractionResult(result, 'document');
      } catch (err) {
        console.error('Document extraction error:', err);
        setErrorMessage(
          language === 'hi'
            ? 'दस्तावेज़ से डेटा निकालने में समस्या आई। कृपया स्पष्ट फ़ोटो अपलोड करें।'
            : 'Failed to extract form fields from document. Please ensure document is clear.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [schema, currentValues, language]
  );

  /**
   * Store and stage extraction results and check for conflicts.
   */
  const handleExtractionResult = (result, source) => {
    if (!result) return;

    setExtractedData(result);
    setConflicts(result.conflicts || []);
    setReviewOpen(true);

    const fieldsCount = Object.keys(result.extractedFields || {}).length;
    if (fieldsCount > 0) {
      setSuccessMessage(
        language === 'hi'
          ? `एआई ने सफलतापूर्वक ${fieldsCount} फ़ील्ड पहचाने हैं। कृपया समीक्षा करें।`
          : `AI detected ${fieldsCount} field(s). Please review and confirm below.`
      );
    } else {
      setErrorMessage(
        language === 'hi'
          ? 'दस्तावेज़ या आवाज़ में कोई मेल खाने वाले फ़ील्ड नहीं मिले।'
          : 'No matching form fields were detected. Please enter manually.'
      );
    }
  };

  /**
   * Resolve a detected conflict by choosing existing value or newly extracted value.
   */
  const resolveConflict = useCallback((fieldName, chosenValue) => {
    setConflicts((prev) => prev.filter((c) => c.fieldName !== fieldName));
    setExtractedData((prev) => {
      if (!prev || !prev.extractedFields) return prev;
      const updated = { ...prev.extractedFields };
      if (updated[fieldName]) {
        updated[fieldName] = {
          ...updated[fieldName],
          value: chosenValue,
          displayValue: String(chosenValue),
        };
      }
      return { ...prev, extractedFields: updated };
    });
  }, []);

  /**
   * Apply confirmed extracted fields into the parent form.
   */
  const applyExtractedFields = useCallback(
    (fieldMapToApply) => {
      if (!onApplyFields || !fieldMapToApply) return;

      // Transform extractedFields map into key-value pairs
      const updates = {};
      Object.entries(fieldMapToApply).forEach(([key, fieldObj]) => {
        const val = typeof fieldObj === 'object' && fieldObj !== null && 'value' in fieldObj
          ? fieldObj.value
          : fieldObj;
        updates[key] = val;
      });

      onApplyFields(updates);
      setReviewOpen(false);
      setExtractedData(null);
      setConflicts([]);
      setSpeechTranscript('');
    },
    [onApplyFields]
  );

  /**
   * Dismiss review drawer / modal.
   */
  const closeReview = useCallback(() => {
    setReviewOpen(false);
  }, []);

  return {
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
    setReviewOpen,
    closeReview,
    errorMessage,
    successMessage,
  };
}

export default useUniversalFormAssistant;
