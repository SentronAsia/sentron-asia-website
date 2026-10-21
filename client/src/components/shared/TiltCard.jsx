import { useRef, useCallback } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import useIsMobile from '../../hooks/useIsMobile.js';

/**
 * TiltCard — CSS perspective tilt with glare highlight.
 * Pure CSS transforms, no WebGL. pointer-events preserved on children.
 * Disabled on mobile and prefers-reduced-motion.
 */
export default function TiltCard({ children, className = '', maxTilt = 12, glare = true }) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const disabled = prefersReduced || isMobile;

  const handleMouseMove = useCallback((e) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;  // 0–1
    const y = (e.clientY - rect.top) / rect.height;   // 0–1
    const rotX = (0.5 - y) * maxTilt;
    const rotY = (x - 0.5) * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    if (glare) {
      const glareEl = el.querySelector('.tilt-glare');
      if (glareEl) {
        glareEl.style.opacity = '1';
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, oklch(1 0 0 / 0.18), transparent 65%)`;
      }
    }
  }, [disabled, maxTilt, glare]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (glare) {
      const glareEl = el.querySelector('.tilt-glare');
      if (glareEl) glareEl.style.opacity = '0';
    }
  }, [disabled, glare]);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 400ms ease', willChange: 'transform', position: 'relative' }}
    >
      {glare && !disabled && (
        <div
          className="tilt-glare"
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            pointerEvents: 'none', opacity: 0, zIndex: 1,
            transition: 'opacity 300ms ease',
          }}
        />
      )}
      {children}
    </div>
  );
}
