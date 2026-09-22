import { Router } from 'express';
import PageSeo from '../models/PageSeo.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pageSeoSchema } from '../validators/schemas.js';

const router = Router();

// GET — Admin: list all page SEO entries
router.get('/', async (req, res, next) => {
  try {
    const seoEntries = await PageSeo.find().sort({ page: 1 });
    res.json({ success: true, data: seoEntries });
  } catch (error) { next(error); }
});

// GET /:page — Public: get SEO for a specific page
router.get('/:page', async (req, res, next) => {
  try {
    const seo = await PageSeo.findOne({ page: req.params.page });
    res.json({ success: true, data: seo || {} });
  } catch (error) { next(error); }
});

// PUT /:page — Admin: upsert SEO for a page
router.put('/:page', authenticate, requireAdmin, validate(pageSeoSchema), async (req, res, next) => {
  try {
    const seo = await PageSeo.findOneAndUpdate(
      { page: req.params.page },
      { ...req.body, page: req.params.page },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: seo });
  } catch (error) { next(error); }
});

export default router;
