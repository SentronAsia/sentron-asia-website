import { useState, useEffect, useCallback } from 'react';

/**
 * useTheme — Reactively reads the current theme from the data-theme attribute
 * on <html>. Returns { theme, isDark } and updates live when the toggle fires,
 * without requiring a page reload.
 *
 * Uses a MutationObserver on document.documentElement to detect attribute changes.
 */
export default function useTheme() {
  const getTheme = useCallback(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }, []);

  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const html = document.documentElement;

    // MutationObserver watches for data-theme attribute changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          setTheme(getTheme());
        }
      }
    });

    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [getTheme]);

  return { theme, isDark: theme === 'dark' };
}
