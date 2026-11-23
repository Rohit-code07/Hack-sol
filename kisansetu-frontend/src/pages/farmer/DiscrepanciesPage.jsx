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
    </div>
  );
}
