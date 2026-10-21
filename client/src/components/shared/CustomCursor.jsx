import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import useIsMobile from '../../hooks/useIsMobile.js';

/**
 * CustomCursor — Animated dot + ring cursor.
 * Disabled on:
 *   - touch devices (useIsMobile / primary pointer: coarse)
 *   - /admin routes
 *   - prefers-reduced-motion
 * Hides on inputs, textareas, selects (auto-detect via mouseover).
 * pointer-events: none on the cursor elements themselves.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Also check coarse pointer (touch screens on desktop-sized windows)
  const isTouch = typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;

  const disabled = prefersReduced || isMobile || isAdmin || isTouch;

  useEffect(() => {
    if (disabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;
    let raf = null;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Snap dot instantly
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    const onOver = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
      if (isInput) {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
      } else {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
      // Expand ring on interactive elements
      const interactive = e.target?.closest('a, button, [role="button"], label');
      if (interactive) {
        ring.style.width = '42px';
        ring.style.height = '42px';
        ring.style.borderColor = 'var(--color-accent)';
      } else {
        ring.style.width = '28px';
        ring.style.height = '28px';
        ring.style.borderColor = 'var(--color-cursor-border)';
      }
    };

    const loop = () => {
      // Lerp ring towards mouse
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX - 14}px, ${ringY - 14}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);

    // Hide native cursor
    document.documentElement.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.documentElement.style.cursor = '';
      if (raf) cancelAnimationFrame(raf);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'opacity 200ms ease',
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 28, height: 28,
          borderRadius: '50%',
          border: '1.5px solid var(--color-cursor-border)',
          background: 'var(--color-cursor-fill)',
          pointerEvents: 'none',
          zIndex: 99998,
          transition: 'width 250ms ease, height 250ms ease, border-color 250ms ease, opacity 200ms ease',
          willChange: 'transform',
          backdropFilter: 'none',
        }}
      />
    </>
  );
}
