import React, { useState, useRef, useId } from 'react';

/**
 * Accessible Tooltip Component for icon-only actions and collapsed navigation items.
 * Supports hover, keyboard focus, and mobile long-press.
 *
 * @param {{
 *   content: React.ReactNode,
 *   children: React.ReactElement,
 *   position?: 'top' | 'bottom' | 'left' | 'right',
 *   className?: string
 * }} props
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();
  const timeoutRef = useRef(null);

  const show = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  if (!content) return children;

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={show}
      onTouchEnd={hide}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      })}

      {isVisible ? (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-70 whitespace-nowrap bg-indigo-900 text-paper-50 text-xs font-medium px-2.5 py-1 rounded-sm shadow-hard-sm pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${positionClasses[position]}`}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
}
