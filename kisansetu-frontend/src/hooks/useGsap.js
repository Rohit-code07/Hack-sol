import { useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useReducedMotion from './useReducedMotion';

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * React hook wrapper around gsap.context() with automatic cleanup.
 * Strictly respects user reduced-motion preferences (callback will not run if reduced motion is enabled).
 * Safe for React 18 StrictMode double-invocations.
 *
 * @param {(gsapInstance: typeof gsap, context: gsap.Context) => void} callback - GSAP animation code
 * @param {React.DependencyList} [deps=[]] - Dependency list
 * @param {React.RefObject<HTMLElement>} [scopeRef] - Optional element ref to scope selectors
 */
export default function useGsap(callback, deps = [], scopeRef = undefined) {
  const prefersReducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    // If reduced motion is requested, do not run any GSAP animations
    if (prefersReducedMotion) return;

    const scope = scopeRef?.current || undefined;
    let ctx = null;

    ctx = gsap.context((self) => {
      callback(gsap, self);
    }, scope);

    return () => {
      ctx?.revert();
    };
  }, [prefersReducedMotion, ...deps]);
}
