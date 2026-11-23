import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useGsap from '../../hooks/useGsap';
import useReducedMotion from '../../hooks/useReducedMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ScrollTrigger Reveal Wrapper Component.
 * Animates element on initial viewport entry (once).
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   delay?: number,
 *   y?: number,
 *   duration?: number
 * }} props
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 16,
  duration = 0.45,
}) {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGsap(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 90%',
          once: true,
        },
      }
    );
  }, [delay, y, duration], containerRef);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
