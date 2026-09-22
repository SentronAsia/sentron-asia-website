import { Routes, Route } from 'react-router-dom';
import PageWrapper from './components/layout/PageWrapper.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminLayout from './features/admin/AdminLayout.jsx';

// Public Pages
import HomePage from './pages/public/HomePage.jsx';
import ProductsPage from './pages/public/ProductsPage.jsx';
import ProductDetailPage from './pages/public/ProductDetailPage.jsx';
import InnovationsPage from './pages/public/InnovationsPage.jsx';
import PalmSensStories from './pages/public/PalmSensStories.jsx';
import DownloadsPage from './pages/public/DownloadsPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';

// Admin Pages
import LoginPage from './pages/admin/LoginPage.jsx';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/admin/ResetPasswordPage.jsx';
import ChangePasswordPage from './pages/admin/ChangePasswordPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import ProductsManager from './pages/admin/ProductsManager.jsx';
import CategoriesManager from './pages/admin/CategoriesManager.jsx';
import BrandsManager from './pages/admin/BrandsManager.jsx';
import StoriesManager from './pages/admin/StoriesManager.jsx';
import PartnersManager from './pages/admin/PartnersManager.jsx';
import DocumentsManager from './pages/admin/DocumentsManager.jsx';
import MediaLibrary from './pages/admin/MediaLibrary.jsx';
import SeoManager from './pages/admin/SeoManager.jsx';
import SettingsManager from './pages/admin/SettingsManager.jsx';

// Import all stylesheets
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/admin.css';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ====== Public Routes ====== */}
      <Route element={<PageWrapper><HomePage /></PageWrapper>} path="/" />
      <Route element={<PageWrapper><ProductsPage /></PageWrapper>} path="/products" />
      <Route element={<PageWrapper><ProductsPage /></PageWrapper>} path="/products/:categoryId" />
      <Route element={<PageWrapper><ProductDetailPage /></PageWrapper>} path="/product/:slug" />
      <Route element={<PageWrapper><InnovationsPage /></PageWrapper>} path="/innovations" />
      <Route element={<PageWrapper><PalmSensStories /></PageWrapper>} path="/innovations/:brandId" />
      <Route element={<PageWrapper><DownloadsPage /></PageWrapper>} path="/downloads" />
      <Route element={<PageWrapper><AboutPage /></PageWrapper>} path="/about" />
      <Route element={<PageWrapper><ContactPage /></PageWrapper>} path="/contact" />

      {/* ====== Admin Auth Routes (no layout) ====== */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/admin/change-password" element={
        <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>
      } />

      {/* ====== Admin Protected Routes ====== */}
      <Route path="/admin" element={
        <ProtectedRoute><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="brands" element={<BrandsManager />} />
        <Route path="stories" element={<StoriesManager />} />
        <Route path="partners" element={<PartnersManager />} />
        <Route path="documents" element={<DocumentsManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="seo" element={<SeoManager />} />
        <Route path="settings" element={<SettingsManager />} />
      </Route>

      {/* ====== 404 ====== */}
      <Route path="*" element={
        <PageWrapper>
          <div className="section container" style={{ textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>404</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Page not found.</p>
          </div>
        </PageWrapper>
      } />
    </Routes>
    </ErrorBoundary>
  );
}
