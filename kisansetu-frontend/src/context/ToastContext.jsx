import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * Toast Provider managing the application-wide notification queue with M5.2 motion tokens.
 * Enter: slide-in-right 300ms, Exit: fade + translateX(12px) 200ms.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, message, type, duration, exiting: false };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep at most 4 toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  const toastHelpers = {
    show: addToast,
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  const variantStyles = {
    success: {
      border: 'border-sage-600 bg-paper-50',
      badge: 'bg-sage-100 text-sage-600',
      icon: <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />,
    },
    error: {
      border: 'border-rust-600 bg-rust-100/20',
      badge: 'bg-rust-100 text-rust-600',
      icon: <AlertCircle className="w-5 h-5 text-rust-600 shrink-0" />,
    },
    warning: {
      border: 'border-ochre-600 bg-ochre-100/20',
      badge: 'bg-ochre-100 text-ochre-600',
      icon: <AlertTriangle className="w-5 h-5 text-ochre-600 shrink-0" />,
    },
    info: {
      border: 'border-indigo-900 bg-paper-50',
      badge: 'bg-paper-100 text-indigo-900',
      icon: <Info className="w-5 h-5 text-indigo-700 shrink-0" />,
    },
  };

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}

      {/* Toast Notification Container */}
      <div
        className="fixed z-60 bottom-safe-toast right-4 sm:right-6 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toastItem) => {
          const style = variantStyles[toastItem.type] || variantStyles.info;

          return (
            <div
              key={toastItem.id}
              role="status"
              className={`pointer-events-auto border-2 ${style.border} shadow-hard rounded-sm p-3.5 sm:p-4 flex items-start gap-3 bg-paper-50 transition-all duration-200 ease-out ${
                toastItem.exiting ? 'opacity-0 translate-x-3' : 'animate-slide-in-right'
              }`}
            >
              <div className="pt-0.5">{style.icon}</div>
              <div className="flex-1 text-xs sm:text-sm text-indigo-900 font-medium leading-relaxed">
                {toastItem.message}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toastItem.id)}
                aria-label="Dismiss notification"
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-ink-muted hover:text-indigo-900 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export function useToast() {
  return useToastContext();
}
