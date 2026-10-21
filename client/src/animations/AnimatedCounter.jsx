import { useEffect, useRef } from 'react';
import { gsap } from './gsapConfig.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

/**
 * AnimatedCounter — Counts up from 0 to a target value when scrolled into view.
 * Parses numeric prefixes/suffixes (e.g. "40+", "10,000+", "50+").
 * Falls back to displaying the raw value immediately when motion is reduced.
 *
 * Props:
 *   value      — string like "40+", "10,000+", "500+"
 *   className  — optional class on the span
 */
export default function AnimatedCounter({ value, className = '' }) {
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    // Parse: extract numeric part and suffix (e.g. "10,000+" → num=10000, suffix="+")
    const raw = String(value);
    const numMatch = raw.match(/[\d,]+/);
    if (!numMatch) return;

    const numStr = numMatch[0].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) return;

    const prefix = raw.slice(0, numMatch.index);
    const suffix = raw.slice(numMatch.index + numMatch[0].length);

    const counter = { val: 0 };

    const tween = gsap.to(counter, {
      val: num,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true,
      },
      onUpdate() {
        const formatted = Math.floor(counter.val).toLocaleString();
        el.textContent = `${prefix}${formatted}${suffix}`;
      },
      onComplete() {
        // Ensure final value is exactly right
        el.textContent = value;
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, prefersReduced]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
