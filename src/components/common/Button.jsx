import React from 'react';
import Spinner from './Spinner';

/**
 * Editorial Print-Styled Button with accessible hit targets (min 44px).
 *
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'ghost' | 'danger',
 *   size?: 'sm' | 'md' | 'lg',
 *   loading?: boolean,
 *   icon?: React.ReactNode,
 *   disabled?: boolean,
 *   className?: string,
 *   children: React.ReactNode,
 *   type?: 'button' | 'submit' | 'reset',
 *   [key: string]: any
 * }} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon = null,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  // All sizes respect WCAG 2.2 AA touch target minimum of 44x44px. Size lg is fixed to h-13 / 52px (M1.1)
  const sizeClasses = {
    sm: 'min-h-[44px] px-3.5 py-2 text-xs uppercase tracking-wider font-semibold',
    md: 'min-h-[44px] h-11 px-5 text-sm tracking-wide font-medium',
    lg: 'min-h-[52px] h-13 px-6 text-base tracking-wide font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-clay-500 text-white border border-indigo-900 hover:bg-clay-600 hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:scale-[0.98] active:shadow-none',
    secondary:
      'bg-paper-50 text-indigo-900 border border-indigo-900 hover:bg-paper-100 hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:scale-[0.98] active:shadow-none',
    ghost:
      'bg-transparent text-indigo-700 hover:text-indigo-900 hover:underline decoration-saffron-400 decoration-2 underline-offset-4 active:scale-[0.98]',
    danger:
      'bg-rust-600 text-white border border-indigo-900 hover:bg-red-700 hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:scale-[0.98] active:shadow-none',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-sm transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 'sm' : 'md'} />
      ) : icon ? (
        <span className="shrink-0" aria-hidden="true">{icon}</span>
      ) : null}
      <span className={loading ? 'opacity-70 transition-opacity duration-150' : ''}>
        {children}
      </span>
    </button>
  );
}
