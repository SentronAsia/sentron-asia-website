import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import brandRoutes from './src/routes/brandRoutes.js';
import partnerRoutes from './src/routes/partnerRoutes.js';
import storyRoutes from './src/routes/storyRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import mediaRoutes from './src/routes/mediaRoutes.js';
import seoRoutes from './src/routes/seoRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';

const app = express();

// ---- Middleware ----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Public Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/showcase-stories', storyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/page-seo', seoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enquiry', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// ---- Admin Routes (reuse same routers; auth middleware applied inside) ----
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/brands', brandRoutes);
app.use('/api/admin/partners', partnerRoutes);
app.use('/api/admin/showcase-stories', storyRoutes);
app.use('/api/admin/documents', documentRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/admin/page-seo', seoRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/settings', settingsRoutes);

// ---- Error Handling ----
app.use(notFound);
app.use(errorHandler);

// ---- Start Server ----
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
