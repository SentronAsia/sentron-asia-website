/**
 * Marquee — Infinite horizontal scrolling container.
 * Pure CSS animation, no JavaScript needed for the scroll.
 * Duplicates children for seamless looping.
 */
export default function Marquee({
  children,
  speed = 30, // seconds for one full cycle
  direction = 'left', // 'left' | 'right'
  pauseOnHover = true,
  className = '',
  blendMode = false, // mix-blend-multiply for partner logos in light mode
}) {
  return (
    <div
      className={`marquee-container ${className}`}
      style={{ '--marquee-speed': `${speed}s` }}
    >
      <div
        className={`marquee-track ${direction === 'right' ? 'marquee-track--reverse' : ''} ${pauseOnHover ? 'marquee-track--hoverable' : ''}`}
      >
        <div className={`marquee-content ${blendMode ? 'marquee-blend' : ''}`}>
          {children}
        </div>
        <div className={`marquee-content ${blendMode ? 'marquee-blend' : ''}`} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
