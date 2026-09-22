import { Router } from 'express';
import Category from '../models/Category.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categorySchema } from '../validators/schemas.js';

const router = Router();

// GET — Public: list all
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
});

// GET /:id — Public: single
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
});

// POST — Admin: create
router.post('/', authenticate, requireAdmin, validate(categorySchema), async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
});

// PUT /:id — Admin: update
router.put('/:id', authenticate, requireAdmin, validate(categorySchema), async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
});

// DELETE /:id — Admin: delete
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) { next(error); }
});

export default router;
