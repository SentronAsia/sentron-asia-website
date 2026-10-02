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
import databaseRoutes from './src/routes/databaseRoutes.js';

const app = express();

// ---- Middleware ----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS: Parse comma-separated origins from env, fall back to localhost for dev.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

// Explicit preflight handler — runs BEFORE cors() middleware.
// Vercel serverless can swallow OPTIONS requests before Express processes them.
// This guarantees the preflight response always has the correct headers.
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization,Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);
    // Exact match against CORS_ORIGIN list
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Also allow any *.vercel.app subdomain (covers preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization', 'Accept'],
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Serverless DB Connection Middleware ----
// On Vercel serverless, there is no persistent process—each invocation may be
// a cold start. We must ensure MongoDB is connected BEFORE any route handler
// touches the database. This middleware lazily connects on the first request
// and reuses the connection for the lifetime of the warm function instance.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed in middleware:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable. Please try again shortly.' });
  }
});

// ---- Root Route ----
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Sentron API is running live!' });
});

// ---- Health Check ----
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default;
    const conn = mongoose.connection;
    const collections = conn.db ? await conn.db.listCollections().toArray() : [];
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        name: conn.name || 'unknown',
        host: conn.host || 'unknown',
        readyState: conn.readyState,
        collections: collections.map(c => c.name),
      },
      env: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        MONGODB_URI_SET: !!process.env.MONGODB_URI,
        MONGODB_URI_DB: process.env.MONGODB_URI
          ? process.env.MONGODB_URI.match(/\.net\/([^?]*)/)?.[1] || 'could not parse'
          : 'not set',
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'not set',
      },
    });
  } catch (err) {
    res.json({ status: 'error', error: err.message, timestamp: new Date().toISOString() });
  }
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
app.use('/api/admin/database', databaseRoutes);

// ---- Error Handling ----
app.use(notFound);
app.use(errorHandler);

// ---- Start Server (local dev only) ----
// On Vercel, api/index.js imports this module and exports `app` directly—
// Vercel's own HTTP layer handles listen(). We only call listen() when
// running locally via `npm run dev` / `node server.js`.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

export default app;
