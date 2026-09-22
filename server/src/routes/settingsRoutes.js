import { Router } from 'express';
import Settings from '../models/Settings.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Partner from '../models/Partner.js';
import Document from '../models/Document.js';
import ShowcaseStory from '../models/ShowcaseStory.js';
import PageSeo from '../models/PageSeo.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { settingsSchema } from '../validators/schemas.js';

const router = Router();

// GET /api/admin/settings — Admin: get global settings
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/settings — Admin: update global settings
router.put('/', authenticate, requireAdmin, validate(settingsSchema), async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/settings/export — Admin: export database
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
