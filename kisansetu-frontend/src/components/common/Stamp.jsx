import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { STATUS_MAP } from '../../constants/statusMap';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Editorial Stamp Badge Component with auto-localization, WCAG contrast, and motion.
 *
 * @param {{
 *  status: string,
 *  label?: string,
 *  rotate?: boolean,
 *  animate?: boolean,
 *  size?: 'sm' | 'md',
 *  className?: string
 * }} props
 */
export default function Stamp({
  status = '',
  label = '',
  rotate = false,
  animate = true,
  size = 'sm',
  className = '',
}) {
  const { t, i18n } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const norm = String(status).trim().toUpperCase();
  const entry = STATUS_MAP[norm];
  const isHindi = i18n.language === 'hi';

  // Determine icon based on status category
  let Icon = Clock;
  let colorClasses = entry?.color || 'bg-paper-100 text-indigo-900 border-indigo-900';

  if (['ACTIVE', 'ELIGIBLE', 'PAID', 'RESOLVED', 'VERIFIED', 'APPROVED', 'OWNED'].includes(norm)) {
    Icon = CheckCircle2;
  } else if (['INACTIVE', 'NOT_ELIGIBLE', 'NPA', 'MISMATCH', 'HIGH', 'DISPUTED', 'REJECTED'].includes(norm)) {
    Icon = ['MISMATCH', 'HIGH', 'NPA', 'DISPUTED'].includes(norm) ? ShieldAlert : XCircle;
  } else if (['PENDING', 'OPEN', 'IN_REVIEW', 'MEDIUM'].includes(norm)) {
    Icon = AlertTriangle;
  } else if (['CLOSED', 'LOW', 'NOT_FOUND', 'LEASED'].includes(norm)) {
    Icon = Check;
  }

  // Stamp rotation feel for verdicts or explicitly requested
  const isVerdictStamp = rotate || norm === 'VERIFIED' || norm === 'MISMATCH' || norm === 'NOT_FOUND';
  const rotationClass = isVerdictStamp ? '-rotate-1 shadow-sm' : '';

  // Animation selection
  let animationClass = '';
  if (animate) {
    if (prefersReducedMotion) {
      animationClass = 'animate-fade-in [animation-duration:150ms]';
    } else if (isVerdictStamp) {
      animationClass = 'animate-stamp-in';
    } else {
      animationClass = 'animate-fade-in';
    }
  }

  // Localized text display
  let displayLabel = label;
  if (!displayLabel) {
    if (entry?.key) {
      displayLabel = t(entry.key, { defaultValue: isHindi ? entry.hi : entry.en });
    } else {
      displayLabel = norm.replace(/_/g, ' ');
    }
  }

  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      key={`${norm}-${displayLabel}`}
      className={`inline-flex items-center gap-1.5 uppercase tracking-wider rounded-sm border ${colorClasses} ${rotationClass} ${sizeClasses} ${animationClass} ${className}`}
      role="status"
    >
      <Icon
        className={size === 'md' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
        strokeWidth={2}
        aria-hidden="true"
      />
      <span>{displayLabel}</span>
    </span>
  );
}
