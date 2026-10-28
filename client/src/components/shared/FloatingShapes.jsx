import { useRef, useEffect } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import useIsMobile from '../../hooks/useIsMobile.js';
import useTheme from '../../hooks/useTheme.js';

/**
 * FloatingShapes — Decorative CSS 3D floating shapes. NO WebGL.
 * Keeps the total canvas count at 1 (HeroScene only).
 * Theme-aware via CSS variables — re-tints via useTheme.
 * Mounts only when in view (IntersectionObserver).
 * Disabled on mobile and prefers-reduced-motion.
 *
 * Renders as position:absolute so parent must be position:relative.
 */

const SHAPES = [
  { type: 'circle',  size: 60,  top: '10%', left: '5%',   delay: 0,   duration: 7 },
  { type: 'square',  size: 40,  top: '60%', left: '88%',  delay: 1.5, duration: 9 },
  { type: 'circle',  size: 30,  top: '75%', left: '12%',  delay: 0.8, duration: 6 },
  { type: 'ring',    size: 70,  top: '25%', left: '80%',  delay: 2,   duration: 11 },
  { type: 'square',  size: 25,  top: '50%', left: '50%',  delay: 3,   duration: 8 },
];

function getShapeStyle(shape, isDark) {
  const base = {
    position: 'absolute',
    top: shape.top,
    left: shape.left,
    width: shape.size,
    height: shape.size,
    pointerEvents: 'none',
    opacity: isDark ? 0.12 : 0.09,
    animationName: 'float-shape',
    animationDuration: `${shape.duration}s`,
    animationDelay: `${shape.delay}s`,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    willChange: 'transform',
    zIndex: 0,
  };

  const color = isDark
    ? 'oklch(0.72 0.12 195 / 0.6)'
    : 'oklch(0.38 0.072 208 / 0.5)';

  if (shape.type === 'circle') {
    return { ...base, borderRadius: '50%', background: color };
  }
  if (shape.type === 'square') {
    return { ...base, borderRadius: '6px', background: color, transform: 'rotate(30deg)' };
  }
  if (shape.type === 'ring') {
    return { ...base, borderRadius: '50%', border: `2px solid ${color}`, background: 'transparent' };
  }
  return base;
}

export default function FloatingShapes({ shapes = SHAPES }) {
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const { isDark } = useTheme();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReduced || isMobile) return;

    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // Pause CSS animations via play-state when off-screen
      el.style.animationPlayState = visible ? 'running' : 'paused';
      for (const child of el.children) {
        child.style.animationPlayState = visible ? 'running' : 'paused';
      }
    }, { threshold: 0 });
    io.observe(el);

    return () => io.disconnect();
  }, [prefersReduced, isMobile]);

  if (prefersReduced || isMobile) return null;

  return (
    <>
      {/* Keyframe injection — inlined so no extra CSS file needed */}
      <style>{`
        @keyframes float-shape {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-20px) rotate(15deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-shapes * { animation: none !important; }
        }
      `}</style>
      <div
        ref={containerRef}
        className="floating-shapes"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}
      >
        {shapes.map((shape, i) => (
          <div key={i} style={getShapeStyle(shape, isDark)} />
        ))}
      </div>
    </>
  );
}
