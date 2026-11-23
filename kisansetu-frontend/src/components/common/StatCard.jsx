import React from 'react';
import Skeleton from './Skeleton';

/**
 * Editorial StatCard for KPIs and summary metrics across Farmer & Bank dashboards.
 *
 * @param {{
 *   label: React.ReactNode,
 *   value: React.ReactNode,
 *   helperText?: React.ReactNode,
 *   icon?: React.ReactNode,
 *   accent?: 'clay' | 'saffron' | 'sage' | 'rust' | 'indigo' | 'neutral',
 *   loading?: boolean,
 *   onClick?: () => void,
 *   className?: string
 * }} props
 */
export default function StatCard({
  label,
  value,
  helperText,
  icon,
  accent = 'clay',
  loading = false,
  onClick,
  className = '',
}) {
  const accentClasses = {
    clay: 'border-l-4 border-l-clay-500 text-clay-500',
    saffron: 'border-l-4 border-l-saffron-400 text-saffron-600',
    sage: 'border-l-4 border-l-sage-600 text-sage-600',
    rust: 'border-l-4 border-l-rust-600 text-rust-600',
    indigo: 'border-l-4 border-l-indigo-900 text-indigo-900',
    neutral: 'border-l-4 border-l-paper-200 text-ink-muted',
  };

  const isClickable = typeof onClick === 'function';
  const Wrapper = isClickable ? 'button' : 'div';

  if (loading) {
    return (
      <div
        className={`bg-paper-50 border border-indigo-900 rounded-sm p-4 sm:p-5 shadow-hard-sm flex flex-col justify-between ${accentClasses[accent]} ${className}`}
        aria-busy="true"
        aria-label="Loading metric"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <Skeleton lines={1} width="96px" />
          <Skeleton variant="circle" className="w-8 h-8 rounded-sm" />
        </div>
        <Skeleton lines={1} height="h-8" width="128px" className="my-1" />
        <Skeleton lines={1} width="160px" />
      </div>
    );
  }

  return (
    <Wrapper
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className={`bg-paper-50 border border-indigo-900 rounded-sm p-4 sm:p-5 shadow-hard-sm flex flex-col justify-between text-left transition-all duration-150 ease-out ${accentClasses[accent]} ${
        isClickable
          ? 'hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400'
          : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs uppercase font-bold tracking-wider text-ink-muted">
          {label}
        </span>
        {icon ? (
          <span className="p-1.5 rounded-sm bg-paper-100 text-indigo-900 shrink-0" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>

      <div className="text-2xl sm:text-3xl font-bold font-serif text-indigo-900 tabular-nums tracking-tight my-1">
        {value}
      </div>

      {helperText ? (
        <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-snug">
          {helperText}
        </p>
      ) : null}
    </Wrapper>
  );
}
