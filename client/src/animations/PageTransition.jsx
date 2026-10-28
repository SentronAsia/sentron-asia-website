import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from './gsapConfig.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

/**
 * PageTransition — Lightweight fade on route changes.
 * ≤300ms, skips /admin, calls ScrollTrigger.refresh() after settle.
 * Content always starts VISIBLE — animation is progressive enhancement only.
 */
export default function PageTransition({ children }) {
  const ref = useRef(null);
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const isAdmin = location.pathname.startsWith('/admin');
  const hasMounted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced || isAdmin) {
      // Always ensure visible
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      // Still refresh ScrollTrigger for the new page
      ScrollTrigger.refresh();
      return;
    }

    if (!hasMounted.current) {
      // First mount: just ensure visible and refresh
      hasMounted.current = true;
      el.style.opacity = '1';
      el.style.transform = 'none';
      ScrollTrigger.refresh();
      return;
    }

    // Subsequent route changes: quick fade out → in
    const tl = gsap.timeline({
      onComplete: () => ScrollTrigger.refresh(),
    });
    tl.to(el, { opacity: 0, y: -6, duration: 0.12, ease: 'power2.in' })
      .set(el, { y: 8 })
      .to(el, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' });

    return () => tl.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ opacity: 1 }}>
      {children}
    </div>
  );
}

