import { useState, useEffect } from 'react';

/**
 * Detects mobile/low-power devices for disabling heavy effects.
 * Returns true for screens <= 768px or devices with <= 4 logical cores.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
