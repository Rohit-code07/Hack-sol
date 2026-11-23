import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Editorial ErrorState Component with single-iteration icon shake and retry action.
 *
 * @param {{
 *   title?: React.ReactNode,
 *   message?: React.ReactNode,
 *   onRetry?: () => void,
 *   retryLabel?: string,
 *   className?: string
 * }} props
 */
export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  className = '',
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={`text-center py-10 sm:py-14 px-4 bg-rust-100/40 border border-rust-600/40 rounded-sm flex flex-col items-center justify-center animate-fade-in ${className}`}
      role="alert"
    >
      {/* Icon with single shake on error (M5.6) */}
      <div
        className={`w-12 h-12 rounded-sm bg-rust-100 border border-rust-600/30 flex items-center justify-center text-rust-600 mb-3 ${
          prefersReducedMotion ? '' : 'animate-shake'
        }`}
        aria-hidden="true"
      >
        <AlertCircle className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold font-serif text-rust-600 mb-1">
        {title || t('errors.generic', 'Something went wrong')}
      </h3>

      <p className="text-xs sm:text-sm text-ink-muted max-w-sm mb-4 leading-relaxed">
        {message || t('errors.network', 'Unable to fetch records. Please try again.')}
      </p>

      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          {retryLabel || t('common.retry', 'Try Again')}
        </Button>
      ) : null}
    </div>
  );
}
