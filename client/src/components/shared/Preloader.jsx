import { useState, useEffect } from 'react';
import { gsap } from '../../animations/gsapConfig.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';

const STORAGE_KEY = 'sentron-preloader-shown';

/**
 * Preloader — Branded entry animation, shown once per browser session.
 *
 * Rules (per user requirements):
 * - Shown ONLY on first visit in a session (sessionStorage gated)
 * - Never blocks auth checks or data fetching — renders as a CSS overlay
 * - Duration: 1.4s max, then self-destructs
 * - Skipped entirely when prefers-reduced-motion is set
 * - Skip also on /admin routes
 */
export default function Preloader() {
  const prefersReduced = useReducedMotion();
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  // Determine if we should show preloader at all
  const shouldShow = !prefersReduced && !isAdmin &&
    typeof sessionStorage !== 'undefined' &&
    !sessionStorage.getItem(STORAGE_KEY);

  const [visible, setVisible] = useState(shouldShow);

  useEffect(() => {
    if (!shouldShow || !visible) return;

    // Mark as shown for this session immediately
    sessionStorage.setItem(STORAGE_KEY, '1');

    const bar = document.getElementById('preloader-bar');
    const logo = document.getElementById('preloader-logo');
    const overlay = document.getElementById('preloader-overlay');

    if (!overlay) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
      },
    });

    tl.fromTo(logo,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
    .to(bar, { width: '100%', duration: 0.6, ease: 'power2.inOut' }, '<0.1')
    .to(overlay, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      delay: 0.1,
    });

    return () => tl.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      id="preloader-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        gap: '1.5rem',
        // Pointer events off so auth/data fetching can start immediately
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* Logo */}
      <div
        id="preloader-logo"
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          opacity: 0,
        }}
      >
        <span style={{ color: 'var(--color-primary)' }}>Sentron</span>
        <span style={{ color: 'var(--color-text)' }}> Asia</span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '160px',
          height: '2px',
          background: 'var(--color-border)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          id="preloader-bar"
          style={{
            height: '100%',
            width: '0%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
            borderRadius: '1px',
          }}
        />
      </div>
    </div>
  );
}
