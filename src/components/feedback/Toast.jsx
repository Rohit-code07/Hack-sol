import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Standalone Editorial Alert / Notification Toast with M5.2 entry and exit transitions.
 *
 * @param {{
 *   message: React.ReactNode,
 *   type?: 'success' | 'error' | 'warning' | 'info',
 *   onClose?: () => void,
 *   duration?: number
 * }} props
 */
export default function Toast({
  message,
  type = 'success',
  onClose,
  duration = 4000,
}) {
  const [isExiting, setIsExiting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!duration || !onClose) return;

    const timer = setTimeout(() => {
      if (prefersReducedMotion) {
        onClose();
      } else {
        setIsExiting(true);
        setTimeout(onClose, 200);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, prefersReducedMotion]);

  if (!message) return null;

  const handleManualDismiss = () => {
    if (prefersReducedMotion || !onClose) {
      onClose?.();
    } else {
      setIsExiting(true);
      setTimeout(onClose, 200);
    }
  };

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rust-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-ochre-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-700 shrink-0" />,
  };

  const borderMap = {
    success: 'border-sage-600',
    error: 'border-rust-600',
    warning: 'border-ochre-600',
    info: 'border-indigo-900',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-safe-toast right-4 sm:right-6 z-60 max-w-sm w-[calc(100%-2rem)] sm:w-full bg-paper-50 border-2 ${
        borderMap[type] || borderMap.info
      } shadow-hard rounded-sm p-4 flex items-start gap-3 transition-all duration-200 ease-out ${
        isExiting
          ? 'opacity-0 translate-x-3'
          : prefersReducedMotion
          ? 'opacity-100'
          : 'animate-slide-in-right'
      }`}
    >
      <div className="pt-0.5">{iconMap[type] || iconMap.info}</div>
      <div className="flex-1 text-xs sm:text-sm text-indigo-900 font-medium leading-relaxed">
        {message}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={handleManualDismiss}
          aria-label="Dismiss toast"
          className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-ink-muted hover:text-indigo-900 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
