import { useEffect, useRef } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import useIsMobile from '../../hooks/useIsMobile.js';
import useTheme from '../../hooks/useTheme.js';

/**
 * ParticleBackground — 2D canvas (no WebGL) particle field.
 * Theme-aware: re-tints live via useTheme.
 * Pauses when off-screen (IntersectionObserver) and tab hidden (visibilitychange).
 * pointer-events: none — never blocks interaction.
 * Disabled on mobile and prefers-reduced-motion.
 */
export default function ParticleBackground({ count = 40, className = '' }) {
  const canvasRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  const stateRef = useRef({ running: false, raf: null, particles: [] });

  useEffect(() => {
    if (prefersReduced || isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    // Particle colour from CSS vars — read each frame to respect live theme switch
    const getColor = () => isDark
      ? 'oklch(0.72 0.12 195 / 0.25)'
      : 'oklch(0.38 0.072 208 / 0.18)';

    // Resize canvas to match parent
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Init particles
    const init = () => {
      state.particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    };
    init();

    const draw = () => {
      if (!state.running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = getColor();
      ctx.fillStyle = color;
      for (const p of state.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      state.raf = requestAnimationFrame(draw);
    };

    // Pause/resume on visibility
    const handleVisibility = () => {
      if (document.hidden) {
        state.running = false;
        if (state.raf) cancelAnimationFrame(state.raf);
      } else if (io.isIntersecting) {
        state.running = true;
        draw();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Pause/resume on off-screen
    let io = { isIntersecting: false };
    const observer = new IntersectionObserver(([entry]) => {
      io = entry;
      if (entry.isIntersecting && !document.hidden) {
        state.running = true;
        draw();
      } else {
        state.running = false;
        if (state.raf) cancelAnimationFrame(state.raf);
      }
    }, { threshold: 0 });
    observer.observe(canvas);

    return () => {
      state.running = false;
      if (state.raf) cancelAnimationFrame(state.raf);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
      ro.disconnect();
    };
  // isDark intentionally not in deps — color read each frame
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced, isMobile, count]);

  if (prefersReduced || isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
