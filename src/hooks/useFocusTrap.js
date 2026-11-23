import { useEffect, useRef } from 'react';

/**
 * Hook to trap keyboard focus within a container element (Modal, Drawer, Sheet).
 * Handles Tab, Shift+Tab wrapping, Escape to close, and restores focus to trigger on close.
 *
 * @param {boolean} isOpen - Whether the container is currently open
 * @param {() => void} onClose - Callback invoked when Escape key is pressed
 * @returns {React.RefObject<HTMLElement>} - Ref to attach to the container
 */
export default function useFocusTrap(isOpen, onClose) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  // Capture the active element when opening to restore later
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Lock body scroll and set initial focus
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside container
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const focusables = containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        containerRef.current.focus();
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Handle Tab wrap and Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        if (!containerRef.current) return;
        const focusables = Array.from(
          containerRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return containerRef;
}
