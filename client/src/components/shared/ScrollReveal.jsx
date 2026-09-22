import { useEffect, useRef } from 'react';

/**
 * ScrollReveal — Wraps children in an element that fades/slides in
 * when it enters the viewport via IntersectionObserver.
 *
 * Uses CSS scroll-driven animations as progressive enhancement
 * where supported, with IntersectionObserver fallback.
 */
export default function ScrollReveal({
  children,
  className = '',
  threshold = 0.15,
  delay = 0,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'none'
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('scroll-reveal--visible');
      return;
    }

    // Check for native CSS scroll-driven animation support
    const hasNativeSupport = CSS.supports?.('(animation-timeline: view()) and (animation-range: entry)');

    if (hasNativeSupport) {
      // Let CSS handle it — just add the native class
      el.classList.add('scroll-reveal--native');
      return;
    }

    // IntersectionObserver fallback
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('scroll-reveal--visible');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const directionClass = direction !== 'none' ? `scroll-reveal--${direction}` : '';

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${directionClass} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
