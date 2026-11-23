import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Accessible Editorial Print-Styled Modal with entrance/exit transitions and focus trap.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title: React.ReactNode,
 *   children: React.ReactNode,
 *   maxWidth?: string,
 *   className?: string
 * }} props
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
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

  const modalRef = useFocusTrap(isRendered && !isClosing, onClose);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-55 flex items-center justify-center p-4 sm:p-6 bg-indigo-900/60 backdrop-blur-sm transition-opacity duration-150 ${
        isClosing ? 'opacity-0' : 'animate-fade-in'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`w-full ${maxWidth} bg-paper-50 border-2 border-indigo-900 shadow-hard-lg rounded-sm overflow-hidden flex flex-col focus:outline-none transition-all duration-150 ${
          isClosing
            ? 'opacity-0 scale-[0.96]'
            : prefersReducedMotion
            ? 'opacity-100'
            : 'animate-scale-in'
        } ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-indigo-900 bg-paper-100">
          <h2 id="modal-title" className="text-lg sm:text-xl font-bold font-serif text-indigo-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[44px] min-w-[44px] -mr-2 -my-2 p-2 text-ink-muted hover:text-indigo-900 hover:bg-paper-200 rounded-sm inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}
