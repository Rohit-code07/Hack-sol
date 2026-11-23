import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Responsive Drawer / Sheet Component with entrance and exit transitions.
 * Desktop (>=768px): Right-side slide-over drawer
 * Mobile (<768px): Bottom sheet drawer
 *
 * Fully accessible with focus-trap, ESC-to-close, and aria-modal.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title: React.ReactNode,
 *   subtitle?: React.ReactNode,
 *   children: React.ReactNode,
 *   footer?: React.ReactNode,
 *   maxWidth?: string,
 *   className?: string
 * }} props
 */
export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-xl',
  className = '',
}) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      if (prefersReducedMotion) {
        setIsRendered(false);
        setIsClosing(false);
      } else {
        setIsClosing(true);
        const timer = setTimeout(() => {
          setIsRendered(false);
          setIsClosing(false);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, isRendered, prefersReducedMotion]);

  const containerRef = useFocusTrap(isRendered && !isClosing, onClose);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col md:flex-row justify-end bg-indigo-900/50 backdrop-blur-sm transition-opacity duration-150 ${
        isClosing ? 'opacity-0' : 'animate-fade-in'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!isOpen}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`w-full ${maxWidth} bg-paper-50 border-t md:border-t-0 md:border-l border-indigo-900 shadow-hard-lg flex flex-col max-h-[90vh] md:max-h-full h-auto md:h-full mt-auto md:mt-0 rounded-t-md md:rounded-none focus:outline-none transition-all duration-150 ${
          isClosing
            ? 'opacity-0 md:translate-x-4'
            : prefersReducedMotion
            ? 'opacity-100'
            : 'animate-slide-in-right'
        } ${className}`}
      >
        {/* Mobile drag handle hint */}
        <div className="w-12 h-1 bg-paper-200 rounded-full mx-auto mt-2 md:hidden" aria-hidden="true" />

        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-paper-200 flex items-start justify-between gap-4 bg-paper-100">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-serif text-indigo-900">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-xs md:text-sm text-ink-muted mt-0.5">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 p-2 text-ink-muted hover:text-indigo-900 hover:bg-paper-200/60 rounded-sm inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {children}
        </div>

        {/* Optional Drawer Footer */}
        {footer ? (
          <div className="px-5 py-3 border-t border-paper-200 bg-paper-100 flex items-center justify-end gap-3 pb-safe">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
