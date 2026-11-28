import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RefreshCw,
  Globe,
  Bot,
  Mic,
  MicOff,
  Square,
  Volume2,
} from 'lucide-react';
import aiApi from '../../api/aiApi';
import Button from '../common/Button';
import ListenButton from '../common/ListenButton';

function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="my-1.5 space-y-1 pl-4 list-disc marker:text-clay-500">
          {currentList.map((item, i) => (
            <li key={i} className="text-xs leading-relaxed">{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-indigo-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(index);
      return;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      flushList(index);
      elements.push(
        <div key={index} className="flex items-start gap-1.5 my-1 text-xs">
          <span className="font-bold text-clay-600 shrink-0">{numMatch[1]}.</span>
          <span className="flex-1 leading-relaxed">{parseInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
    if (bulletMatch) {
      currentList.push(parseInline(bulletMatch[1]));
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(index);
      elements.push(
        <h5 key={index} className="font-bold text-indigo-950 mt-2 mb-1 text-xs">
          {parseInline(trimmed.slice(4))}
        </h5>
      );
      return;
    }

    flushList(index);
    elements.push(
      <p key={index} className="my-1 text-xs leading-relaxed">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList('final');
  return <div className="space-y-0.5">{elements}</div>;
}

export default function KisanAiAssistant() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: isEn
        ? 'Namaste! I am KisanSetu Policy Assistant. Ask me anything about KCC loans, MSP procurement, or PMFBY crop insurance policies based strictly on official Government guidelines.'
        : 'नमस्ते! मैं किसानसेतु नीति सहायक हूँ। आप मुझसे केसीसी ऋण, एमएसपी खरीद अथवा पीएमएफबीवाई फसल बीमा नियमों से संबंधित आधिकारिक प्रश्न पूछ सकते हैं।',
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [langPreference, setLangPreference] = useState(i18n.language === 'en' ? 'English' : 'Hindi');
  const [expandedSources, setExpandedSources] = useState({});

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Cleanup speech/media on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const quickPrompts = isEn
    ? [
        'What is the premium rate for Kharif crops under PMFBY?',
        'How is KCC credit limit calculated by banks?',
        'What is the prompt repayment incentive under KCC?',
        'What is the mandatory payment timeline for MSP Mandi procurement?',
      ]
    : [
        'खरीफ फसलों के लिए PMFBY में कितना प्रीमियम देय है?',
        'KCC ऋण सीमा (Credit Limit) का निर्धारण कैसे होता है?',
        'समय पर KCC चुकाने पर कितने प्रतिशत छूट (Incentive) मिलती है?',
        'मंडी में MSP खरीद का भुगतान कितने घंटे के भीतर होना अनिवार्य है?',
      ];

  const handleSend = async (questionText = input) => {
    const q = (questionText || '').trim();
    if (!q || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat({
        question: q,
        language: langPreference,
      });

      const responseData = res?.data;
      const answerText = responseData?.answer || responseData?.responseText || (
        isEn
          ? 'Unable to retrieve answer. Please try again.'
          : 'उत्तर प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।'
      );

      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: answerText,
        sources: responseData?.sources || [],
        confidence: responseData?.confidence || 'RETRIEVAL_SUPPORTED',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: isEn
          ? 'Could not connect to KisanSetu AI service through Spring Boot gateway. Please ensure backend is running.'
          : 'स्प्रिंग बूट गेटवे के माध्यम से AI सेवा से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।',
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSourceExpand = (msgId, srcIdx) => {
    const key = `${msgId}-${srcIdx}`;
    setExpandedSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // =========================================================================
  // VOICE RECORDING & SPEECH-TO-TEXT LOGIC
  // =========================================================================
  const startRecording = async () => {
    setVoiceError(null);
    setRecordingSeconds(0);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      // Primary: Web Speech API (low latency in-browser speech recognition)
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = langPreference === 'English' ? 'en-IN' : 'hi-IN';

        recognition.onstart = () => {
          setIsRecording(true);
          recordingTimerRef.current = setInterval(() => {
            setRecordingSeconds((prev) => prev + 1);
          }, 1000);
        };

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setInput(currentTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            setVoiceError(isEn ? 'Microphone permission denied' : 'माइक्रोफ़ोन की अनुमति अस्वीकृत');
            stopRecording();
          } else {
            // Fallback to MediaRecorder audio capture
            fallbackToMediaRecorder();
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {
        console.warn('Web Speech API failed to start, falling back to MediaRecorder', e);
      }
    }

    // Fallback: MediaRecorder sending audio blob to backend
    fallbackToMediaRecorder();
  };

  const fallbackToMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (audioBlob.size > 0) {
          setIsTranscribing(true);
          try {
            const res = await aiApi.transcribeVoice(audioBlob, langPreference);
            if (res?.data?.text) {
              setInput(res.data.text);
            }
          } catch (err) {
            setVoiceError(
              isEn ? 'Failed to transcribe audio' : 'ऑडियो ट्रांसक्राइब करने में असमर्थ'
            );
          } finally {
            setIsTranscribing(false);
          }
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setVoiceError(
        isEn ? 'Microphone access required for voice input' : 'आवाज इनपुट हेतु माइक्रोफ़ोन अनुमति आवश्यक है'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Outer glow ring */}
        <span className="absolute inset-0 rounded-sm animate-ping opacity-40 bg-saffron-400 pointer-events-none" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isEn ? 'Open KisanSetu AI Assistant' : 'किसान नीति सहायक खोलें'}
          className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-br from-amber-400 via-saffron-500 to-orange-500 hover:from-amber-300 hover:via-saffron-400 hover:to-orange-400 text-indigo-950 font-serif font-bold text-sm border-2 border-indigo-900 rounded-sm shadow-hard transition-all transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ring-2 ring-amber-300 ring-offset-1"
          style={{ boxShadow: '0 0 18px 4px rgba(251,191,36,0.55), 0 4px 16px rgba(0,0,0,0.18)' }}
        >
          <Sparkles className="w-5 h-5 text-indigo-950 animate-pulse drop-shadow" />
          <span className="hidden sm:inline drop-shadow-sm">
            {isEn ? 'Policy AI Sahayak' : 'किसान नीति सहायक'}
          </span>
        </button>
      </div>

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[450px] h-[580px] max-h-[82vh] bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard-lg z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Header */}
          <div className="bg-paper-100 p-3.5 border-b-2 border-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xs bg-saffron-500 border border-indigo-900 flex items-center justify-center text-indigo-950">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-indigo-950 leading-tight">
                  {isEn ? 'KisanSetu Policy Assistant' : 'किसानसेतु नीति सहायक'}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-sage-800 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
                  <span>{isEn ? '100% Policy Grounded RAG' : 'सत्यापित नीति भंडार (RAG)'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLangPreference((prev) => (prev === 'English' ? 'Hindi' : 'English'))}
                className="px-2 py-0.5 text-[10px] font-mono font-bold bg-paper-50 hover:bg-paper-200 border border-indigo-900 text-indigo-950 rounded-xs flex items-center gap-1 shadow-hard-xs"
                title="Switch Query Language"
              >
                <Globe className="w-3 h-3 text-clay-600" />
                <span>{langPreference}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-ink-muted hover:text-indigo-950 hover:bg-paper-200 rounded-xs transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-paper-100/50 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-xs border leading-relaxed ${
                      isUser
                        ? 'bg-indigo-900 text-paper-50 border-indigo-950 rounded-br-none shadow-hard-sm'
                        : 'bg-paper-50 text-indigo-950 border-paper-300 rounded-bl-none shadow-hard-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <FormattedMessage text={m.text} />
                    )}

                    {/* Grounded Sources & Citations */}
                    {!isUser && Array.isArray(m.sources) && m.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-paper-200 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-clay-700 tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
                          <span>{isEn ? 'Official Government Sources:' : 'आधिकारिक सरकारी संदर्भ:'}</span>
                        </div>

                        <div className="space-y-1">
                          {m.sources.map((src, idx) => {
                            const isExpanded = Boolean(expandedSources[`${m.id}-${idx}`]);
                            return (
                              <div
                                key={idx}
                                className="bg-paper-100 border border-paper-300 rounded-xs p-1.5 text-[11px]"
                              >
                                <div
                                  className="flex items-center justify-between cursor-pointer text-indigo-900 font-bold"
                                  onClick={() => toggleSourceExpand(m.id, idx)}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <FileText className="w-3 h-3 text-clay-600 shrink-0" />
                                    <span className="truncate">{src.document}</span>
                                    <span className="text-[10px] font-mono text-sage-800 bg-sage-50 px-1 border border-sage-300 rounded-xs shrink-0">
                                      p. {src.page}
                                    </span>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-clay-500 shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-clay-500 shrink-0" />
                                  )}
                                </div>

                                {isExpanded && src.excerpt && (
                                  <div className="mt-1 pt-1 border-t border-paper-200 text-ink-muted text-[10px] leading-snug">
                                    <p className="italic font-serif">"{src.excerpt}"</p>
                                    {src.authority && (
                                      <span className="text-[9px] text-clay-600 block mt-0.5">
                                        Authority: {src.authority}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[9px] text-ink-muted">{m.timestamp}</span>
                    {!isUser && (
                      <ListenButton
                        text={m.text}
                        title={isEn ? "Policy Answer" : "नीति उत्तर"}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-clay-700 text-xs italic p-2 bg-paper-50 border border-paper-200 rounded-xs w-fit shadow-hard-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-saffron-600" />
                <span>{isEn ? 'Searching official policy repository...' : 'आधिकारिक नीति भंडार में खोज जारी है...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestion Strip */}
          <div className="bg-paper-200 px-3 py-1.5 border-t border-b border-paper-300 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px]">
            <span className="text-[10px] font-bold text-clay-600 uppercase tracking-wider shrink-0">
              {isEn ? 'Ask:' : 'पूछें:'}
            </span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading || isRecording}
                className="px-2 py-0.5 bg-paper-50 hover:bg-white text-indigo-900 border border-paper-300 rounded-xs text-[10px] font-serif transition-colors truncate max-w-[200px]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Active Voice Recording Status Bar */}
          {isRecording && (
            <div className="px-3 py-2 bg-rust-50 border-t border-rust-200 flex items-center justify-between animate-fade-in text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rust-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rust-600" />
                </span>

                {/* Animated Waveform */}
                <div className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden="true">
                  <span className="w-0.5 bg-rust-600 rounded-full h-full animate-wave" style={{ animationDelay: '0s' }} />
                  <span className="w-0.5 bg-rust-600 rounded-full h-full animate-wave" style={{ animationDelay: '0.15s' }} />
                  <span className="w-0.5 bg-rust-600 rounded-full h-full animate-wave" style={{ animationDelay: '0.3s' }} />
                  <span className="w-0.5 bg-rust-600 rounded-full h-full animate-wave" style={{ animationDelay: '0.45s' }} />
                </div>

                <span className="font-bold text-rust-800">
                  {langPreference === 'Hindi' ? 'सुन रहे हैं (बोलें)...' : 'Listening (Speak now)...'}
                </span>
                <span className="font-mono text-[11px] text-rust-700 bg-rust-100 px-1.5 py-0.2 rounded-xs font-bold">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="px-2 py-0.5 bg-rust-600 hover:bg-rust-700 text-white rounded-xs font-bold text-[10px] flex items-center gap-1 shadow-hard-xs transition-colors"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>{isEn ? 'Done' : 'पूर्ण'}</span>
              </button>
            </div>
          )}

          {isTranscribing && (
            <div className="px-3 py-1.5 bg-saffron-50 border-t border-saffron-200 flex items-center gap-2 text-xs text-indigo-950 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-saffron-600" />
              <span>{isEn ? 'Transcribing audio with Gemini...' : 'ऑडियो का पाठ तैयार किया जा रहा है...'}</span>
            </div>
          )}

          {voiceError && (
            <div className="px-3 py-1 bg-rust-100 border-t border-rust-300 text-rust-800 text-[11px] flex items-center justify-between">
              <span>{voiceError}</span>
              <button type="button" onClick={() => setVoiceError(null)} className="text-rust-900 font-bold ml-2">×</button>
            </div>
          )}

          {/* Input Box with Voice & Send Controls */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isRecording) stopRecording();
              handleSend();
            }}
            className="p-2.5 bg-paper-50 border-t border-paper-300 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isEn
                  ? 'Ask or speak about KCC interest, MSP dates, PMFBY...'
                  : 'केसीसी ब्याज, एमएसपी भुगतान, फसल बीमा के नियम पूछें या बोलें...'
              }
              disabled={loading}
              className="flex-1 bg-white text-indigo-950 placeholder-ink-muted px-3 py-2 border border-paper-300 rounded-xs text-xs focus:outline-none focus:ring-1 focus:ring-indigo-900"
            />

            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={loading}
              aria-label={isRecording ? (isEn ? 'Stop recording' : 'रिकॉर्डिंग बंद करें') : (isEn ? 'Start voice input' : 'आवाज में पूछें')}
              title={isRecording ? (isEn ? 'Stop recording' : 'रिकॉर्डिंग रोकें') : (isEn ? 'Voice input (Hindi/English)' : 'आवाज से पूछें (हिंदी/अंग्रेजी)')}
              className={`p-2 rounded-xs border transition-all active:scale-95 ${
                isRecording
                  ? 'bg-rust-600 text-white border-rust-700 animate-pulse shadow-hard-xs'
                  : 'bg-paper-100 hover:bg-paper-200 text-clay-600 border-paper-300 hover:text-indigo-950'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !input.trim()}
              className="px-3"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
