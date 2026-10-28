import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Torus, Octahedron } from '@react-three/drei';
import useTheme from '../../hooks/useTheme.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import useIsMobile from '../../hooks/useIsMobile.js';

/* ---- Theme palette (mirrors CSS tokens) ---- */
const PALETTE = {
  light: { primary: '#1f5c7a', accent: '#4da3c8', ambient: '#c8e8f5', bg: 'transparent' },
  dark:  { primary: '#6ecfe0', accent: '#50d4a0', ambient: '#0d2a38', bg: 'transparent' },
};

/* ---- Single floating molecule-like shape ---- */
function Molecule({ position, speed, rotAxis, color, shape = 'sphere' }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.rotation.x += rotAxis[0] * 0.005;
    ref.current.rotation.y += rotAxis[1] * 0.005;
    ref.current.position.y = position[1] + Math.sin(t) * 0.3;
  });

  const mat = <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} transparent opacity={0.82} />;

  return (
    <group ref={ref} position={position}>
      {shape === 'torus' && <Torus args={[0.55, 0.18, 16, 48]}>{mat}</Torus>}
      {shape === 'oct'   && <Octahedron args={[0.55, 0]}>{mat}</Octahedron>}
      {shape === 'sphere'&& <Sphere args={[0.42, 32, 32]}>{mat}</Sphere>}
    </group>
  );
}

/* ---- Scene that re-tints live on theme change ---- */
function Scene({ isDark }) {
  const p = isDark ? PALETTE.dark : PALETTE.light;

  // Scene background is transparent via Canvas gl={{ alpha: true }}
  // R3F handles this; no mutation needed here

  return (
    <>
      <ambientLight color={p.ambient} intensity={isDark ? 0.6 : 0.8} />
      <directionalLight color={p.primary} intensity={isDark ? 1.2 : 0.9} position={[5, 8, 5]} />
      <pointLight color={p.accent} intensity={isDark ? 1.5 : 1.0} position={[-4, 3, -3]} />

      <Molecule position={[-2.2, 0.5, -1]}   speed={0.6} rotAxis={[1, 0.5, 0]} color={p.primary} shape="torus" />
      <Molecule position={[ 2.4, -0.4, -2]}  speed={0.8} rotAxis={[0.3, 1, 0]} color={p.accent}  shape="oct" />
      <Molecule position={[ 0.2,  1.2, -3]}  speed={0.5} rotAxis={[0.5, 0.5, 1]} color={p.primary} shape="sphere" />
      <Molecule position={[-1.0, -1.2, -1.5]}speed={0.9} rotAxis={[1, 0.2, 0.5]} color={p.accent}  shape="sphere" />
    </>
  );
}

/* ---- Exported component (lazy-loaded in HomePage) ---- */
export default function HeroScene() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  // Pause render loop when off-screen or tab hidden
  const pausedRef = useRef(false);
  const glRef = useRef(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const handleVisibility = () => { pausedRef.current = document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);

    const io = new IntersectionObserver(([entry]) => {
      pausedRef.current = !entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(el);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      io.disconnect();
    };
  }, []);

  // WebGL check — fallback renders nothing (gradient CSS takes over)
  const hasWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { return false; }
  })();

  if (prefersReduced || isMobile || !hasWebGL) return null;

  return (
    <div
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <Canvas
        ref={glRef}
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        frameloop="always"
        onCreated={({ gl }) => {
          // Throttle frame loop: skip frames when paused
          const origSetAnimationLoop = gl.setAnimationLoop.bind(gl);
          gl.setAnimationLoop((callback) => {
            origSetAnimationLoop((time) => {
              if (!pausedRef.current) callback(time);
            });
          });
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene isDark={isDark} />
      </Canvas>
    </div>
  );
}
