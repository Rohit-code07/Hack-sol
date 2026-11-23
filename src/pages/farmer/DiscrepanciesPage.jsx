import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  AlertOctagon,
  FileText,
  Calendar,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Building2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useDiscrepancies from '../../hooks/useDiscrepancies';
import { formatDate } from '../../utils/formatters';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PageHeader from '../../components/common/PageHeader';
import Stamp from '../../components/common/Stamp';
import Panel from '../../components/common/Panel';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import Skeleton from '../../components/common/Skeleton';
import Reveal from '../../components/motion/Reveal';

/**
 * Discrepancy Alerts Page with scroll reveal, severity categorization, and TTS wave indicator.
 */
export default function DiscrepanciesPage() {
  const { t, i18n } = useTranslation();
  const { farmerId } = useAuth();
  useDocumentTitle('discrepancies.title', 'Discrepancy Alerts');

  const { discrepancies, loading, error, retry } = useDiscrepancies(farmerId || 'FRM-0003');
  const [speakingId, setSpeakingId] = useState(null);

  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const handleSpeak = (item) => {
    if (!hasSpeech) return;

    if (speakingId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${item.ruleCode}. ${item.description}. ${item.recommendedAction}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setSpeakingId(item.id);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const highList = discrepancies.filter((d) => d.severity === 'HIGH');
  const mediumList = discrepancies.filter((d) => d.severity === 'MEDIUM');
  const lowList = discrepancies.filter((d) => d.severity === 'LOW');

  if (error) {
    return (
      <ErrorState
        title={t('errors.loadFailed', 'Unable to load discrepancy alerts')}
        onRetry={retry}
      />
    );
  }

  const renderDiscrepancyCard = (item, accent) => {
    const isSpeaking = speakingId === item.id;

    return (
      <Reveal key={item.id}>
        <Panel accent={accent} className="shadow-hard-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paper-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-indigo-900 font-mono">
                {item.ruleCode}
              </span>
              <Stamp status={item.severity} />

              {/* Sunein Audio Button with 4-Bar Wave Indicator (M3.4, M3.7) */}
              {hasSpeech ? (
                <button
                  type="button"
                  onClick={() => handleSpeak(item)}
                  aria-label={isSpeaking ? t('discrepancies.stopAloud', 'Stop listening') : t('discrepancies.readAloud', 'Listen to alert')}
                  className="min-h-[44px] px-2.5 py-1 inline-flex items-center gap-1.5 text-ink-muted hover:text-indigo-900 bg-paper-100 hover:bg-paper-200 border border-paper-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 rounded-sm text-xs font-semibold"
                >
                  {isSpeaking ? (
                    <>
                      <div className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden="true">
                        <span className="w-0.5 bg-clay-500 rounded-full h-full animate-wave" style={{ animationDelay: '0s' }} />
                        <span className="w-0.5 bg-clay-500 rounded-full h-full animate-wave" style={{ animationDelay: '0.15s' }} />
                        <span className="w-0.5 bg-clay-500 rounded-full h-full animate-wave" style={{ animationDelay: '0.3s' }} />
                        <span className="w-0.5 bg-clay-500 rounded-full h-full animate-wave" style={{ animationDelay: '0.45s' }} />
                      </div>
                      <span className="text-clay-500 font-bold">{t('discrepancies.playing', 'Sunein...')}</span>
                      <VolumeX className="w-3.5 h-3.5 text-rust-600 ml-0.5" />
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-clay-500" />
                      <span>{t('discrepancies.listen', 'Sunein')}</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {t('discrepancies.detectedOn', 'Detected')}: {formatDate(item.detectedAt, i18n.language)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-indigo-900 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Collapsible Action & Context Details */}
          <div className="bg-paper-100 p-3.5 rounded-sm border border-paper-200 text-xs space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-clay-500 block">
              {t('discrepancies.recommendedAction', 'Recommended Action')}:
            </span>
            <p className="text-indigo-900 leading-relaxed">{item.recommendedAction}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              {item.resolved ? (
                <Stamp status="RESOLVED" label={t('discrepancies.resolved', 'Resolved')} />
              ) : (
                <Stamp status="PENDING" label={t('discrepancies.unresolved', 'Action Required')} />
              )}
            </div>

            {!item.resolved && (
              <Link
                to={`/farmer/grievances?category=WRONG_LAND_RECORD&ref=${encodeURIComponent(
                  item.ruleCode
                )}&desc=${encodeURIComponent(item.description)}`}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FileText className="w-4 h-4 text-clay-500" />}
                >
                  {t('discrepancies.fileGrievance', 'File Resolution Grievance')}
                </Button>
              </Link>
            )}
          </div>
        </Panel>
      </Reveal>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow={t('discrepancies.eyebrow', 'Automated Integrity Checks')}
        title={t('discrepancies.title', 'Cadastre & Credit Discrepancies')}
        subtitle={t('discrepancies.subtitle', 'Cross-checked anomalies between your revenue records, bank loans, and subsidies.')}
      />

      {/* Summary Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-paper-100 p-4 border border-indigo-900 rounded-sm shadow-hard-sm animate-fade-in">
        <div>
          <span className="text-xs uppercase font-bold text-ink-muted block">
            {t('discrepancies.totalAlerts', 'Total Flags')}
          </span>
          <span className="text-2xl font-bold font-serif text-indigo-900 tabular-nums">
            {discrepancies.length}
          </span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-rust-600 block">
            {t('discrepancies.severityHigh', 'High Priority')}
          </span>
          <span className="text-2xl font-bold font-serif text-rust-600 tabular-nums">
            {highList.length}
          </span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-ochre-600 block">
            {t('discrepancies.severityMed', 'Medium Priority')}
          </span>
          <span className="text-2xl font-bold font-serif text-ochre-600 tabular-nums">
            {mediumList.length}
          </span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-ink-muted block">
            {t('discrepancies.severityLow', 'Low Priority')}
          </span>
          <span className="text-2xl font-bold font-serif text-indigo-900 tabular-nums">
            {lowList.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : discrepancies.length === 0 ? (
        <Panel accent="sage" className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-sage-100 border border-sage-600 text-sage-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-serif text-indigo-900">
            {t('discrepancies.empty', 'No Discrepancies Detected')}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            {t('discrepancies.emptySub', 'Your land records and credit accounts are fully synchronized.')}
          </p>
        </Panel>
      ) : (
        <div className="space-y-8">
          {/* HIGH Severity Section with Stagger (M3.4) */}
          {highList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rust-600">
                <AlertOctagon className="w-4 h-4" />
                <h2 className="text-xs uppercase font-bold tracking-wider">
                  01 • {t('discrepancies.severityHigh', 'High Priority')} ({highList.length})
                </h2>
              </div>
              <div className="space-y-4">
                {highList.map((item) => renderDiscrepancyCard(item, 'rust'))}
              </div>
            </div>
          )}

          {/* MEDIUM Severity Section */}
          {mediumList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-ochre-600">
                <h2 className="text-xs uppercase font-bold tracking-wider">
                  02 • {t('discrepancies.severityMed', 'Medium Priority')} ({mediumList.length})
                </h2>
              </div>
              <div className="space-y-4">
                {mediumList.map((item) => renderDiscrepancyCard(item, 'ochre'))}
              </div>
            </div>
          )}

          {/* LOW Severity Section */}
          {lowList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-900">
                <h2 className="text-xs uppercase font-bold tracking-wider">
                  03 • {t('discrepancies.severityLow', 'Low Priority')} ({lowList.length})
                </h2>
              </div>
              <div className="space-y-4">
                {lowList.map((item) => renderDiscrepancyCard(item, 'indigo'))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          AGRISTACK REAL-TIME CROSS-VERIFICATION & SYNC MONITOR
          ========================================================================= */}
      <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-5 shadow-hard space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-200 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-saffron-500" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 font-mono block">
                राष्ट्रीय कृषि डेटाबेस एकीकरण (AgriStack Engine v2.4)
              </span>
              <h3 className="font-serif font-bold text-base sm:text-lg text-indigo-950">
                भूलेख, आधार एवं बैंक डेटाबेस रियल-टाइम मिलान स्थिति
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2.5 py-1 border border-sage-600 rounded-xs">
            <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <span>अंतिम ऑडिट: 15 फ़रवरी 2026, 09:30 AM</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-clay-600 block">01 • डिजिटल भूलेख (7/12)</span>
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>खसरा 102/1 व 145/2 लिंक</span>
            </div>
            <p className="text-[11px] text-ink-muted">महाराष्ट्र ई-महाभूमि पोर्टल से सिंक</p>
          </div>

          <div className="p-3 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-clay-600 block">02 • PM-KISAN DBT</span>
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>आधार NPCI मैपिंग सत्यापित</span>
            </div>
            <p className="text-[11px] text-ink-muted">19वीं किस्त सफलतापूर्वक प्रेषित</p>
          </div>

          <div className="p-3 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-clay-600 block">03 • CERSAI ऋण रजिस्ट्री</span>
            <div className="font-bold text-rust-600 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rust-600" />
              <span>1 खाता अतिदेय (NPA अलर्ट)</span>
            </div>
            <p className="text-[11px] text-ink-muted">बैंक ऑफ महाराष्ट्र शाखा संबद्ध</p>
          </div>

          <div className="p-3 bg-paper-50 rounded-xs border border-paper-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-clay-600 block">04 • उपग्रह GIS कैडस्ट्रे</span>
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>100% जियो-बाउंड्री मैप्ड</span>
            </div>
            <p className="text-[11px] text-ink-muted">PMFBY फसल बीमा से एकीकृत</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4-STEP STATUTORY RESOLUTION WORKFLOW
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-paper-200 pb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-clay-700 font-mono block">
              पारदर्शी डिजिटल प्रक्रिया
            </span>
            <h3 className="font-serif font-bold text-lg text-indigo-950">
              विसंगति सुधार एवं डिजिटलीकरण चरणबद्ध मार्गदर्शिका
            </h3>
          </div>
          <span className="text-xs font-serif font-bold text-indigo-900">4 सरल चरण</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl font-serif font-bold text-clay-600">01</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-paper-200 text-indigo-900 rounded-xs">ऑनलाइन</span>
              </div>
              <h4 className="font-bold text-sm text-indigo-950">ई-केवाईसी आधार प्रमाणीकरण</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                बायोमीट्रिक अथवा OTP द्वारा आधार नाम व जन्मतिथि का आधिकारिक मिलान।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-semibold text-sage-800">
              ✓ स्वतः डेटा सत्यापन
            </div>
          </div>

          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl font-serif font-bold text-clay-600">02</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-paper-200 text-indigo-900 rounded-xs">उपग्रह GIS</span>
              </div>
              <h4 className="font-bold text-sm text-indigo-950">खसरा सीमांकन व सर्वे</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                ड्रोन अथवा उपग्रह नक्शे द्वारा वास्तविक जोत रकबे का सीमांकन व सत्यापन।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-semibold text-sage-800">
              ✓ त्रुटिरहित क्षेत्रफल माप
            </div>
          </div>

          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl font-serif font-bold text-clay-600">03</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-paper-200 text-indigo-900 rounded-xs">बैंकिंग सिंक</span>
              </div>
              <h4 className="font-bold text-sm text-indigo-950">बैंक खाता व NPCI मैपिंग</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                शाखा प्रबंधक द्वारा KCC खाते में स्पेलिंग शुद्धि एवं 4% ब्याज अनुदान सक्रियण।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-semibold text-sage-800">
              ✓ DBT सीधा लाभ सुनिश्चित
            </div>
          </div>

          <div className="bg-paper-100 border-2 border-indigo-900 rounded-sm p-4 shadow-hard flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xl font-serif font-bold text-clay-600">04</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-paper-200 text-indigo-900 rounded-xs">डिजिटल हस्ताक्षर</span>
              </div>
              <h4 className="font-bold text-sm text-indigo-950">पटवारी अनुमोदन व शुद्धि</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                राजस्व निरीक्षक द्वारा डिजिटल हस्ताक्षरित 7/12 खतौनी का अंतिम निर्गमन।
              </p>
            </div>
            <div className="mt-3 pt-2 text-[11px] font-semibold text-sage-800">
              ✓ विसंगति का 100% निस्तारण
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          WARDHA TEHSIL E-SEVA HELPDESK & STATUTORY RIGHTS
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-5 shadow-hard-sm space-y-3">
          <div className="flex items-center justify-between border-b border-paper-200 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-clay-600 shrink-0" />
              <h4 className="font-serif font-bold text-base text-indigo-950">
                वर्धा तहसील ई-सेवा केंद्र व पटवारी डेस्क
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-sage-800 bg-sage-50 px-2 py-0.5 border border-sage-600 rounded-xs">
              खुला: 10 AM - 5 PM
            </span>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            ऑनलाइन विसंगति सुधार में किसी भी कठिनाई हेतु किसान सीधे वर्धा तहसील परिसर स्थित विशेष राजस्व सहायता केंद्र पर संपर्क कर सकते हैं:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-paper-100 rounded-xs border border-paper-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-indigo-950 block">चंद्रपुर खुर्द सर्कल तलाठी कार्यालय</span>
                <span className="text-[11px] text-ink-muted">पटवारी: श्री सचिन कांबले • फोन: 94221-XXXXX</span>
              </div>
              <span className="text-[11px] font-bold text-clay-600 bg-paper-50 px-2 py-1 border border-paper-200">पंचायत भवन</span>
            </div>

            <div className="p-2.5 bg-paper-100 rounded-xs border border-paper-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-indigo-950 block">वर्धा जिला भूलेख ई-हेल्पडेस्क</span>
                <span className="text-[11px] text-ink-muted">टोल-फ्री समाधान: 1800-120-8040 • ईमेल: help.bhulekh@maharashtra.gov.in</span>
              </div>
              <span className="text-[11px] font-bold text-sage-700 bg-paper-50 px-2 py-1 border border-paper-200">24x7 सेवा</span>
            </div>
          </div>
        </div>

        <div className="bg-paper-50 border-2 border-indigo-900 rounded-sm p-5 shadow-hard-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-950 border-b border-paper-200 pb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-900 shrink-0" />
            <h4 className="font-serif font-bold text-base text-indigo-950">
              महाराष्ट्र भू-राजस्व संहिता 1966 (धारा 155 अंतर्गत वैधानिक अधिकार)
            </h4>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            धारा 155 के प्रावधानों के अंतर्गत राजस्व अभिलेखों (7/12, 8-A एवं खसरा खतौनी) में लिपिकीय अथवा लिपिक-संबंधी अशुद्धियों को ठीक कराने का प्रत्येक खातेदार को निःशुल्क कानूनी अधिकार प्राप्त है।
          </p>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-sage-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>नाम, उपनाम एवं पिता के नाम की वर्तनी त्रुटि का 48 घंटे में समाधान</span>
            </div>
            <div className="flex items-center gap-2 text-sage-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>सुधार हेतु कोई अदालती स्टाम्प शुल्क अथवा कोर्ट फीस देय नहीं है</span>
            </div>
            <div className="flex items-center gap-2 text-sage-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>सुधार के उपरांत बैंक ऋण सीमा व DBT स्वतः बहाल हो जाते हैं</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
