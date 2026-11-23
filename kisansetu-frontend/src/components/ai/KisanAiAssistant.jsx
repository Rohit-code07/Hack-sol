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
  Bot
} from 'lucide-react';
import aiApi from '../../api/aiApi';
import Button from '../common/Button';

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

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isEn ? 'Open KisanSetu AI Assistant' : 'किसान नीति सहायक खोलें'}
          className="flex items-center gap-2.5 px-4 py-3 bg-saffron-500 hover:bg-saffron-400 text-indigo-950 font-serif font-bold text-sm border-2 border-indigo-900 rounded-sm shadow-hard transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-900"
        >
          <Sparkles className="w-5 h-5 text-indigo-950 animate-pulse" />
          <span className="hidden sm:inline">
            {isEn ? 'Policy AI Sahayak' : 'किसान नीति सहायक'}
          </span>
        </button>
      </div>

      {/* Slide-out / Pop-up Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] max-w-[480px] h-[580px] max-h-[80vh] z-50 bg-paper-50 border-2 border-indigo-900 rounded-sm shadow-hard flex flex-col overflow-hidden animate-fade-in"
          role="dialog"
          aria-labelledby="ai-chat-title"
        >
          {/* Header */}
          <div className="bg-indigo-950 text-paper-50 px-4 py-3 border-b-2 border-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xs bg-saffron-500 flex items-center justify-center text-indigo-950 font-bold border border-indigo-900">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 id="ai-chat-title" className="font-serif font-bold text-sm leading-tight text-paper-50">
                  {isEn ? 'KisanSetu Policy Assistant' : 'किसान नीति सहायक'}
                </h3>
                <span className="text-[10px] text-saffron-300 font-mono tracking-wider block">
                  {isEn ? 'Grounded Government Scheme RAG' : 'सत्यापित सरकारी नीति RAG'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={() => setLangPreference(langPreference === 'Hindi' ? 'English' : 'Hindi')}
                className="text-[11px] font-mono px-2 py-0.5 border border-indigo-800 bg-indigo-900 text-saffron-300 rounded-xs hover:bg-indigo-800"
                title="Toggle Language"
              >
                {langPreference}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-paper-300 hover:text-paper-50 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-paper-100 bg-grain text-xs">
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
                  <span className="text-[9px] text-ink-muted px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-clay-700 text-xs italic p-2 bg-paper-50 border border-paper-200 rounded-xs w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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
                disabled={loading}
                className="px-2 py-0.5 bg-paper-50 hover:bg-white text-indigo-900 border border-paper-300 rounded-xs text-[10px] font-serif transition-colors truncate max-w-[200px]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
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
                  ? 'Ask about KCC interest, MSP mandi dates, PMFBY...'
                  : 'केसीसी ब्याज, एमएसपी भुगतान, फसल बीमा के नियम पूछें...'
              }
              disabled={loading}
              className="flex-1 bg-white text-indigo-950 placeholder-ink-muted px-3 py-2 border border-paper-300 rounded-xs text-xs focus:outline-none focus:ring-1 focus:ring-indigo-900"
            />
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
