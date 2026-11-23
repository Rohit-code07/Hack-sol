import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Editorial Form Field with persistent uppercase label, clean border, error and hint.
 *
 * @param {{
 *   id?: string,
 *   label?: React.ReactNode,
 *   type?: string,
 *   error?: React.ReactNode,
 *   hint?: React.ReactNode,
 *   options?: Array<{ value: string, label: string } | string>,
 *   className?: string,
 *   rows?: number,
 *   required?: boolean,
 *   [key: string]: any
 * }} props
 */
export default function Field({
  id,
  label,
  type = 'text',
  error,
  hint,
  options = [],
  className = '',
  rows = 4,
  required = false,
  ...props
}) {
  const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const hintId = inputId ? `${inputId}-hint` : undefined;

  const baseInputClasses =
    'w-full bg-white border border-indigo-900 rounded-sm px-3.5 py-2.5 text-indigo-900 placeholder-ink-muted text-sm transition-colors duration-150 focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:ring-offset-2 disabled:bg-paper-100 disabled:cursor-not-allowed';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs uppercase font-bold tracking-wider text-indigo-700 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rust-600 ml-1">*</span>}
          </span>
        </label>
      )}

      {type === 'select' ? (
        <select
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${baseInputClasses} ${error ? 'border-rust-600' : ''}`}
          required={required}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={inputId}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${baseInputClasses} ${error ? 'border-rust-600' : ''}`}
          required={required}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${baseInputClasses} ${error ? 'border-rust-600' : ''}`}
          required={required}
          {...props}
        />
      )}

      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}

      {/* Slide-down validation error (M6.2) */}
      {error && (
        <p
          id={errorId}
          className="text-xs text-rust-600 flex items-center gap-1 font-medium animate-slide-down [animation-duration:180ms]"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
