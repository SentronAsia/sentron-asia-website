import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { HiOutlineBars3, HiXMark, HiChevronDown, HiLockClosed } from 'react-icons/hi2';
import ThemeToggle from '../shared/ThemeToggle.jsx';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  {
    label: 'Innovations',
    to: '/innovations',
    dropdown: true,
  },
  { label: 'Downloads', to: '/downloads' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Scroll detection for header shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      id="site-header"
      className={`site-header glass-panel-light ${scrolled ? 'site-header--scrolled' : ''}`}
    >
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo" aria-label="Sentron Asia International home">
          <span className="header-logo-text">
            <span className="header-logo-accent">Sentron</span> Asia
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <div
                key={link.to}
                className="nav-dropdown-wrapper"
                ref={dropdownRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link--active' : ''}`
                  }
                >
                  {link.label}
                  <HiChevronDown className={`nav-dropdown-icon ${dropdownOpen ? 'nav-dropdown-icon--open' : ''}`} />
                </NavLink>
                {dropdownOpen && (
                  <div className="nav-dropdown glass-card-light">
                    <Link to="/innovations" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      All Brands
                    </Link>
                    <div className="nav-dropdown-divider" />
                    <p className="nav-dropdown-hint">Select a brand to explore innovations and case studies.</p>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Right Section: Theme Toggle + Admin + Mobile Menu */}
        <div className="header-actions">
          <ThemeToggle />
          <Link
            to="/admin/login"
            className="admin-lock-btn"
            aria-label="Admin login"
            title="Admin Login"
          >
            <HiLockClosed />
          </Link>
          <button
            id="mobile-menu-toggle"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <HiXMark /> : <HiOutlineBars3 />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
          <nav
            className="mobile-nav glass-panel-light"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? 'mobile-nav-link--active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
