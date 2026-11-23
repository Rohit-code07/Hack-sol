import React from 'react';

/**
 * Editorial Bordered Panel Card with micro-interactions.
 *
 * @param {{
 *  accent?: 'clay' | 'rust' | 'ochre' | 'sage' | 'indigo' | 'saffron' | null,
 *  hoverEffect?: boolean,
 *  className?: string,
 *  children: React.ReactNode,
 *  [key: string]: any
 * }} props
 */
export default function Panel({
  accent = null,
  hoverEffect = false,
  className = '',
  children,
  ...props
}) {
  const accentClasses = {
    clay: 'border-t-4 border-t-clay-500',
    rust: 'border-t-4 border-t-rust-600',
    ochre: 'border-t-4 border-t-ochre-600',
    sage: 'border-t-4 border-t-sage-600',
    indigo: 'border-t-4 border-t-indigo-700',
    saffron: 'border-t-4 border-t-saffron-400',
  };

  const hoverClass = hoverEffect
    ? 'hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 ease-out'
    : 'transition-shadow duration-150 ease-out';

  return (
    <div
      className={`bg-paper-50 border border-indigo-900 rounded-sm p-5 sm:p-6 focus-within:outline-none focus-within:shadow-hard ${
        accent ? accentClasses[accent] || '' : ''
      } ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
