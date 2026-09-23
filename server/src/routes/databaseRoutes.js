import { Router } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Partner from '../models/Partner.js';
import Document from '../models/Document.js';
import ShowcaseStory from '../models/ShowcaseStory.js';
import PageSeo from '../models/PageSeo.js';
import Settings from '../models/Settings.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/database/export — Admin: export database
router.get('/export', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [products, categories, brands, partners, documents, showcaseStories, pageSeo, settings] = await Promise.all([
      Product.find({}),
      Category.find({}),
      Brand.find({}),
      Partner.find({}),
      Document.find({}),
      ShowcaseStory.find({}),
      PageSeo.find({}),
      Settings.find({})
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      collections: {
        products,
        categories,
        brands,
        partners,
        documents,
        showcaseStories,
        pageSeo,
        settings
      }
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `sentron-db-backup-${dateStr}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    next(error);
  }
});

export default router;
