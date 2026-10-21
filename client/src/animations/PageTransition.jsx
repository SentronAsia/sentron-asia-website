import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from './gsapConfig.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

/**
 * PageTransition — Applies a lightweight fade transition between route changes.
 *
 * Rules (per user requirements):
 * - Never applied to /admin routes
 * - Duration ≤ 300ms total (150ms out, 150ms in)
 * - Does NOT use AnimatePresence (avoids React Router 7 conflicts)
 * - Calls ScrollTrigger.refresh() after each route settles
 * - Falls back to instant switch when motion is reduced
 * - Auth checks / data fetching are never delayed
 */
export default function PageTransition({ children }) {
  const ref = useRef(null);
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const isAdmin = location.pathname.startsWith('/admin');
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced || isAdmin) {
      // Ensure element is always fully visible on admin/reduced-motion
      if (el) gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const isFirstMount = prevPathRef.current === location.pathname;
    prevPathRef.current = location.pathname;

    if (isFirstMount) {
      // Initial page load — just fade in, no out phase
      gsap.fromTo(el,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: () => {
            // Refresh ScrollTrigger after content settles
            ScrollTrigger.refresh();
          },
        }
      );
      return;
    }

    // Route change — fade out current, then in on next render
    const tl = gsap.timeline();
    tl.to(el, { opacity: 0, y: -6, duration: 0.12, ease: 'power2.in' })
      .fromTo(el,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.18,
          ease: 'power2.out',
          onComplete: () => {
            ScrollTrigger.refresh();
          },
        }
      );

    return () => tl.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ opacity: (prefersReduced || isAdmin) ? 1 : undefined }}>
      {children}
    </div>
  );
}
