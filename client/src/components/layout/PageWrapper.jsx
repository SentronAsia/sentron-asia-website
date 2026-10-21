import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import useLenis from '../../hooks/useLenis.js';

export default function PageWrapper({ children }) {
  const { pathname } = useLocation();
  const lenisRef = useLenis();

  // Fallback scroll-to-top when Lenis is not active (e.g. admin routes)
  useEffect(() => {
    if (!lenisRef.current) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, lenisRef]);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-main" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
