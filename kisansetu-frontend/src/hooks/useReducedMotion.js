import { useState, useEffect } from 'react';

/**
 * Hook to detect whether the user has enabled reduced motion in their system.
 * Listens for system preference changes dynamically.
 *
 * @returns {boolean} True if prefers-reduced-motion is active, false otherwise.
 */
export default function useReducedMotion() {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (event) => {
      setMatches(event.matches);
    };

    // Modern browsers support addEventListener on MediaQueryList
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMotionPreference);
      return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(updateMotionPreference);
      return () => mediaQuery.removeListener(updateMotionPreference);
    }
  }, []);

  return matches;
}
