import { useCallback } from 'react';
import { HiSun, HiMoon } from 'react-icons/hi2';

export default function ThemeToggle() {
  const isDark = typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'dark';

  const toggle = useCallback(() => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    // Enable transitions temporarily
    html.classList.add('theme-transitioning');

    if (next === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }

    localStorage.setItem('sentron-theme', next);

    // Remove transition class after animation completes
    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 350);
  }, []);

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle-btn"
    >
      <HiSun className="theme-icon theme-icon--sun" />
      <HiMoon className="theme-icon theme-icon--moon" />
    </button>
  );
}
