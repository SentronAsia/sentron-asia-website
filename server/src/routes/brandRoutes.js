import { Router } from 'express';
import Brand from '../models/Brand.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { brandSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found.' });
    res.json({ success: true, data: brand });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireAdmin, validate(brandSchema), async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, data: brand });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, requireAdmin, validate(brandSchema), async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found.' });
    res.json({ success: true, data: brand });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found.' });
    res.json({ success: true, message: 'Brand deleted.' });
  } catch (error) { next(error); }
});

export default router;
