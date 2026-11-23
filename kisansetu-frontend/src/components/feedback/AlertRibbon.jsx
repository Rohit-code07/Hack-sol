import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Discrepancy Alert Ribbon for Farmer View (M5.3).
 * Top border rust, slide-down enter, pulse-once ring (single shot), non-dismissible.
 *
 * @param {{
 *   count?: number,
 *   to?: string,
 *   className?: string
 * }} props
 */
export default function AlertRibbon({
  count = 1,
  to = '/farmer/discrepancies',
  className = '',
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  if (count <= 0) return null;

  return (
    <div
      role="alert"
      className={`bg-rust-100 border-t-4 border-t-rust-600 border-x border-b border-indigo-900 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
        prefersReducedMotion ? '' : 'animate-slide-down animate-pulse-once'
      } ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-rust-600 text-white flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm text-rust-600 uppercase tracking-wide">
            {count} {t('farmer.alertBanner', 'Discrepancies Require Attention')}
          </p>
          <p className="text-xs text-indigo-900 mt-0.5">
            {t('discrepancies.subtitle', 'Cross-registry audit discrepancies requiring resolution')}
          </p>
        </div>
      </div>

      <Link
        to={to}
        className="inline-flex items-center gap-1.5 self-end sm:self-auto text-xs font-bold uppercase tracking-wider text-rust-600 bg-white border border-rust-600 px-3 py-1.5 rounded-sm hover:bg-rust-600 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-saffron-400 active:scale-[0.98]"
      >
        <span>{t('farmer.viewAlerts', 'View Alerts')}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
