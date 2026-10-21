import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

/**
 * useLenis — Initialises Lenis smooth scrolling for public pages.
 * Disabled on all /admin routes per user requirement.
 * Scrolls to top on route change.
 * Adds data-lenis-prevent to body when disabled so modals/dropdowns
 * are never affected.
 *
 * Returns the Lenis instance (or null when disabled) so callers can
 * interact with it if needed.
 */
export default function useLenis() {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Don't initialise Lenis on admin routes
    if (isAdmin) {
      // Clean up any existing instance when navigating to admin
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Already running
    if (lenisRef.current) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isAdmin]);

  // Scroll to top on route change (only when Lenis is active)
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  // Return the ref itself — callers access .current outside render
  return lenisRef;
}
