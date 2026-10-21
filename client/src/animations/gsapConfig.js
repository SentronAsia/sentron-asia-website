import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * GSAP Configuration — registers plugins and sets global defaults.
 * Import this file once at app initialisation.
 */

gsap.registerPlugin(ScrollTrigger);

// Global defaults for smoother, consistent animations
gsap.defaults({
  ease: 'power2.out',
  duration: 0.8,
});

// ScrollTrigger defaults
ScrollTrigger.defaults({
  toggleActions: 'play none none none', // play on enter, do nothing on leave/re-enter
});

export { gsap, ScrollTrigger };
