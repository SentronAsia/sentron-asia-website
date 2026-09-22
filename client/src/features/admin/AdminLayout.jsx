import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineHome, HiOutlineCube, HiOutlineSquares2X2, HiOutlineTag,
  HiOutlineSparkles, HiOutlineUserGroup, HiOutlineDocumentText,
  HiOutlinePhoto, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle,
  HiOutlineBars3, HiXMark, HiOutlineAdjustmentsHorizontal,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import SEOHead from '../../components/shared/SEOHead.jsx';
import ThemeToggle from '../../components/shared/ThemeToggle.jsx';

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: HiOutlineHome, end: true },
  { to: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { to: '/admin/categories', label: 'Categories', icon: HiOutlineSquares2X2 },
  { to: '/admin/brands', label: 'Brands', icon: HiOutlineTag },
  { to: '/admin/stories', label: 'Showcase Stories', icon: HiOutlineSparkles },
  { to: '/admin/partners', label: 'Partners', icon: HiOutlineUserGroup },
  { to: '/admin/documents', label: 'Documents', icon: HiOutlineDocumentText },
  { to: '/admin/media', label: 'Media Library', icon: HiOutlinePhoto },
  { to: '/admin/seo', label: 'Page SEO', icon: HiOutlineCog6Tooth },
  { to: '/admin/settings', label: 'Settings', icon: HiOutlineAdjustmentsHorizontal },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <SEOHead title="Admin" noindex />

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
          <div className="admin-sidebar-header">
            <span className="admin-sidebar-title">
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sentron</span> CMS
            </span>
            <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
              <HiXMark />
            </button>
          </div>

          <nav className="admin-sidebar-nav">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`
                }
              >
                <item.icon className="admin-nav-icon" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <button className="admin-nav-link" onClick={handleLogout}>
              <HiOutlineArrowRightOnRectangle className="admin-nav-icon" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Sidebar Backdrop (mobile) */}
        {sidebarOpen && (
          <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="admin-main">
          {/* Top Bar */}
          <header className="admin-topbar glass-panel-light">
            <button className="admin-topbar-menu" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <HiOutlineBars3 />
            </button>
            <div style={{ flex: 1 }} />
            <ThemeToggle />
            <div className="admin-user-badge">
              <span className="admin-user-avatar">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
              <span className="admin-user-email">{user?.email || 'Admin'}</span>
            </div>
          </header>

          {/* Page Content */}
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
