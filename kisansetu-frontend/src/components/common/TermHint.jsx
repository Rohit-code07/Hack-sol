import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X } from 'lucide-react';

const GLOSSARY_TERMS = {
  KHASRA: {
    en: {
      term: 'Khasra / Survey Number',
      desc: 'The unique identification number assigned to a specific parcel of agricultural land in government revenue records.',
    },
    hi: {
      term: 'खसरा / सर्वे नंबर',
      desc: 'राजस्व रिकॉर्ड में आपकी कृषि भूमि के विशेष टुकड़े को दिया गया विशिष्ट पहचान क्रमांक।',
    },
  },
  NPA: {
    en: {
      term: 'NPA (Non-Performing Asset)',
      desc: 'A loan account where overdue installments have remained unpaid for over 90 days, requiring bank attention or settlement.',
    },
    hi: {
      term: 'एनपीए (अतिदेय ऋण खाता)',
      desc: 'ऐसा लोन खाता जिसकी किस्त 90 दिनों से अधिक समय से बकाया है और बैंक द्वारा ध्यान या समाधान की आवश्यकता है।',
    },
  },
  KCC: {
    en: {
      term: 'KCC (Kisan Credit Card)',
      desc: 'Credit scheme offering farmers timely, short-term loans at subsidized interest rates (typically 4% with prompt repayment).',
    },
    hi: {
      term: 'केसीसी (किसान क्रेडिट कार्ड)',
      desc: 'किसानों को सस्ती ब्याज दर (समय पर भुगतान पर मात्र 4%) पर खेती की लागत के लिए दिया जाने वाला रियायती ऋण।',
    },
  },
  MSP: {
    en: {
      term: 'MSP (Minimum Support Price)',
      desc: 'The guaranteed minimum price declared by the Government for agricultural crops to protect farmers against sharp price drops.',
    },
    hi: {
      term: 'एमएसपी (न्यूनतम समर्थन मूल्य)',
      desc: 'सरकार द्वारा तय की गई वह न्यूनतम गारंटीशुदा कीमत जिस पर किसान की फसल खरीदी जाती है ताकि घाटा न हो।',
    },
  },
  DBT: {
    en: {
      term: 'DBT (Direct Benefit Transfer)',
      desc: 'Direct electronic transfer of government subsidies or benefits straight into the verified bank account of the beneficiary farmer.',
    },
    hi: {
      term: 'डीबीटी (प्रत्यक्ष लाभ अंतरण)',
      desc: 'सरकारी योजना की सब्सिडी या राशि सीधे किसान के बैंक खाते में बिना किसी बिचौलिए के जमा होना।',
    },
  },
  PMFBY: {
    en: {
      term: 'PMFBY (Crop Insurance Scheme)',
      desc: 'Pradhan Mantri Fasal Bima Yojana provides financial support and claim settlement to farmers suffering crop damage due to natural calamities.',
    },
    hi: {
      term: 'पीएम फसल बीमा योजना',
      desc: 'प्राकृतिक आपदाओं से फसल खराब होने पर किसानों को वित्तीय सुरक्षा और भरपाई देने वाली सरकारी बीमा योजना।',
    },
  },
};

/**
 * Editorial TermHint Component for inline rural jargon explanations.
 *
 * @param {{
 *   term?: 'KHASRA' | 'NPA' | 'KCC' | 'MSP' | 'DBT' | 'PMFBY',
 *   title?: string,
 *   desc?: string,
 *   children?: React.ReactNode,
 *   className?: string
 * }} props
 */
export default function TermHint({
  term,
  title,
  desc,
  children,
  className = '',
}) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const termData = term ? GLOSSARY_TERMS[term.toUpperCase()]?.[lang] : null;
  const displayTitle = title || termData?.term || term;
  const displayDesc = desc || termData?.desc || '';

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span ref={containerRef} className={`relative inline-flex items-center align-middle ${className}`}>
      {children ? <span>{children}</span> : null}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Explain term: ${displayTitle}`}
        className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-ink-muted hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 rounded-full"
      >
        <HelpCircle className="w-3.5 h-3.5 text-clay-500/80 hover:text-clay-500 transition-colors" />
      </button>

      {isOpen ? (
        <span
          role="dialog"
          aria-label={displayTitle}
          className="absolute z-60 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 sm:w-72 bg-paper-50 border-2 border-indigo-900 shadow-hard p-3.5 rounded-sm text-left animate-in fade-in zoom-in-95 duration-150 block"
        >
          <span className="flex items-start justify-between gap-2 border-b border-paper-200 pb-1.5 mb-2">
            <span className="font-bold font-serif text-sm text-indigo-900 block">
              {displayTitle}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="text-ink-muted hover:text-indigo-900 p-0.5 rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
          <span className="text-xs text-ink-muted leading-relaxed block">
            {displayDesc}
          </span>
        </span>
      ) : null}
    </span>
  );
}
