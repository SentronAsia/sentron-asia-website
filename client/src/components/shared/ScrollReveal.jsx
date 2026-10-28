import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../animations/gsapConfig.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';

/**
 * ScrollReveal — Same external API as before, upgraded to GSAP internals.
 *
 * Props (unchanged):
 *   children, className, threshold, delay, direction
 *
 * Behaviour:
 * - Content is always visible by default (opacity: 1 in CSS)
 * - GSAP animates it on scroll if available
 * - If JS/animation fails → content remains visible
 * - Respects prefers-reduced-motion
 * - direction: 'up' | 'down' | 'left' | 'right' | 'none'
 */
export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.15,
  delay = 0,
  direction = 'up',
}) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    // Compute direction offsets
    let yFrom = 0, xFrom = 0;
    if (direction === 'up')    yFrom = 28;
    if (direction === 'down')  yFrom = -28;
    if (direction === 'left')  xFrom = -28;
    if (direction === 'right') xFrom = 28;

    const startOffset = Math.round((1 - threshold) * 80);

    // Set initial hidden state via GSAP (not CSS — so no-JS = visible)
    gsap.set(el, { opacity: 0, y: yFrom, x: xFrom });

    // Create ScrollTrigger that animates to visible on enter
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: `top ${startOffset + 20}%`,
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.75,
          delay: delay / 1000,
          ease: 'power2.out',
        });
      },
    });

    // Safety: if element is already past the trigger point (e.g. page loaded
    // with it in view), ScrollTrigger.refresh() should catch it. But as a
    // belt-and-suspenders fallback, force-reveal after a short delay.
    const safetyTimer = setTimeout(() => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
        gsap.to(el, { opacity: 1, y: 0, x: 0, duration: 0.4, ease: 'power2.out' });
      }
    }, 1500);

    // Also refresh ScrollTrigger after a microtask so elements already in
    // view get their onEnter fired immediately
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      clearTimeout(safetyTimer);
      trigger.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, delay, prefersReduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

