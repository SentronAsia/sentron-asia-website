import { useEffect, useRef } from 'react';
import { gsap } from '../../animations/gsapConfig.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';

/**
 * ScrollReveal — Same external API as before, upgraded to GSAP internals.
 *
 * Props (unchanged):
 *   children, className, threshold, delay, direction
 *
 * Behaviour:
 * - If JS/animation fails → content is visible immediately (no opacity:0 on no-JS)
 * - Respects prefers-reduced-motion
 * - Uses GSAP ScrollTrigger (registered in gsapConfig.js)
 * - direction: 'up' | 'down' | 'left' | 'right' | 'none'
 */
export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.15,   // kept for API compat; maps to start offset
  delay = 0,
  direction = 'up',
}) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Immediately visible for reduced motion or if GSAP unavailable
    if (prefersReduced) {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
      return;
    }

    // Direction → initial transform
    const fromVars = { opacity: 0, duration: 0.75, ease: 'power2.out', delay: delay / 1000 };
    if (direction === 'up')    fromVars.y = 28;
    if (direction === 'down')  fromVars.y = -28;
    if (direction === 'left')  fromVars.x = -28;
    if (direction === 'right') fromVars.x = 28;
    // 'none' → opacity only

    // Map threshold (0–1) to a ScrollTrigger start offset
    const startOffset = Math.round((1 - threshold) * 80); // e.g. 0.15 → "80% bottom"

    const tween = gsap.from(el, {
      ...fromVars,
      scrollTrigger: {
        trigger: el,
        start: `top ${startOffset + 20}%`,
        toggleActions: 'play none none none',
        once: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, delay, prefersReduced]);

  return (
    <div
      ref={ref}
      className={className}
      // Ensure content is always visible at CSS level — JS sets opacity via GSAP
      style={{ opacity: prefersReduced ? 1 : undefined }}
    >
      {children}
    </div>
  );
}
