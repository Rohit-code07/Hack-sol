import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Animated numerical counter component using GSAP.
 * Formats numbers on each frame and renders accessible hidden label for screen readers.
 *
 * @param {{
 *   value: number,
 *   duration?: number,
 *   format?: (val: number) => string,
 *   className?: string
 * }} props
 */
export default function CountUp({
  value = 0,
  duration = 900,
  format,
  className = '',
}) {
  const numericValue = typeof value === 'number' ? value : Number(value) || 0;
  const prefersReducedMotion = useReducedMotion();

  const spanRef = useRef(null);
  const prevValueRef = useRef(0);
  const [formattedDisplay, setFormattedDisplay] = useState(() =>
    format ? format(numericValue) : String(numericValue)
  );

  useEffect(() => {
    const finalFormatted = format ? format(numericValue) : String(numericValue);
    setFormattedDisplay(finalFormatted);

    // If reduced motion is requested, immediately jump to target value
    if (prefersReducedMotion) {
      if (spanRef.current) {
        spanRef.current.textContent = finalFormatted;
      }
      prevValueRef.current = numericValue;
      return;
    }

    const state = { val: prevValueRef.current };
    const tween = gsap.to(state, {
      val: numericValue,
      duration: duration / 1000,
      ease: 'power2.out',
      onUpdate: () => {
        if (spanRef.current) {
          const currentRounded = Math.round(state.val);
          spanRef.current.textContent = format ? format(currentRounded) : String(currentRounded);
        }
      },
      onComplete: () => {
        if (spanRef.current) {
          spanRef.current.textContent = finalFormatted;
        }
        prevValueRef.current = numericValue;
      },
    });

    return () => {
      tween.kill();
    };
  }, [numericValue, duration, format, prefersReducedMotion]);

  const accessibleText = format ? format(numericValue) : String(numericValue);

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      {/* Visual animated counter (hidden from screen reader to avoid auditory chatter) */}
      <span ref={spanRef} aria-hidden="true">
        {formattedDisplay}
      </span>
      {/* Screen-reader accessible static label */}
      <span className="sr-only">{accessibleText}</span>
    </span>
  );
}
