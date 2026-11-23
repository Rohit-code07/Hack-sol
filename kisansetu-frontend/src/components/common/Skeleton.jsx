import React from 'react';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Editorial Skeleton Loader Component with linear shimmer animation.
 *
 * @param {{
 *   variant?: 'text' | 'card' | 'table-row' | 'circle',
 *   rows?: number,
 *   lines?: number,
 *   height?: string,
 *   rounded?: string,
 *   width?: string,
 *   className?: string
 * }} props
 */
export default function Skeleton({
  variant = 'text',
  rows = 1,
  lines,
  height = 'h-4',
  rounded = 'rounded-sm',
  width,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion();
  const totalRows = lines !== undefined ? lines : rows;

  const shimmerBase = prefersReducedMotion
    ? 'bg-paper-200'
    : 'bg-gradient-to-r from-paper-200 via-paper-100 to-paper-200 bg-[length:200%_100%] animate-shimmer';

  if (variant === 'circle') {
    return (
      <div
        className={`rounded-full shrink-0 ${shimmerBase} ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-paper-50 border border-indigo-900 rounded-sm p-5 shadow-hard-sm space-y-3 ${className}`}
        aria-busy="true"
        aria-label="Loading content..."
      >
        <div className={`h-4 w-1/3 ${rounded} ${shimmerBase}`} />
        <div className={`h-8 w-2/3 ${rounded} ${shimmerBase}`} />
        <div className={`h-3 w-1/2 ${rounded} ${shimmerBase}`} />
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading table data...">
        {Array.from({ length: totalRows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-4 py-2 border-b border-paper-200/60">
            <div className={`h-4 w-1/5 ${rounded} ${shimmerBase}`} />
            <div className={`h-4 w-2/5 ${rounded} ${shimmerBase}`} />
            <div className={`h-4 w-1/5 ${rounded} ${shimmerBase}`} />
            <div className={`h-4 w-1/5 ${rounded} ${shimmerBase}`} />
          </div>
        ))}
      </div>
    );
  }

  // Default text skeleton lines
  return (
    <div className={`space-y-2.5 ${className}`} aria-busy="true" aria-label="Loading...">
      {Array.from({ length: totalRows }).map((_, idx) => (
        <div
          key={idx}
          className={`${height} ${rounded} ${shimmerBase}`}
          style={{
            width: width ? width : totalRows > 1 && idx === totalRows - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  );
}
