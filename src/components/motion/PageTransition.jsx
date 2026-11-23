import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import useGsap from '../../hooks/useGsap';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Route transition wrapper component.
 * Executes a subtle fade-up (12px, 400ms, stagger 60ms for [data-reveal] targets).
 * Falls back to a clean 150ms opacity cross-fade when reduced motion is preferred.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
export default function PageTransition({ children, className = '' }) {
  const location = useLocation();
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useGsap(() => {
    if (!containerRef.current) return;

    if (prefersReducedMotion) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: 'power1.out' }
      );
      return;
    }

    const revealTargets = containerRef.current.querySelectorAll('[data-reveal]');
    if (revealTargets && revealTargets.length > 0) {
      gsap.fromTo(
        revealTargets,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );
    } else {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    }
  }, [location.pathname, prefersReducedMotion], containerRef);

  return (
    <div
      key={location.pathname}
      ref={containerRef}
      className={`w-full ${className}`}
    >
      {children}
    </div>
  );
}
