import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Partner from '../models/Partner.js';
import Document from '../models/Document.js';
import MediaLibrary from '../models/MediaLibrary.js';

const router = Router();

// GET /api/admin/dashboard/stats — Dashboard overview counts
router.get('/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [products, categories, brands, partners, documents, media] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Brand.countDocuments(),
      Partner.countDocuments(),
      Document.countDocuments(),
      MediaLibrary.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { products, categories, brands, partners, documents, media },
    });
  } catch (error) { next(error); }
});

export default router;
