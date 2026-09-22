import { Router } from 'express';
import ShowcaseStory from '../models/ShowcaseStory.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { storySchema } from '../validators/schemas.js';

const router = Router();

// GET — Admin: list all stories (with brand populated)
router.get('/', async (req, res, next) => {
  try {
    const stories = await ShowcaseStory.find()
      .populate('brandId', 'name slug logo')
      .sort({ createdAt: -1 });
    const data = stories.map((s) => ({
      ...s.toJSON(),
      brand: s.brandId ? { _id: s.brandId._id, name: s.brandId.name } : null,
    }));
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

// GET /:brandId — Public: stories for a specific brand
router.get('/:brandId', async (req, res, next) => {
  try {
    const stories = await ShowcaseStory.find({ brandId: req.params.brandId })
      .sort({ createdAt: 1 });
    res.json({ success: true, data: stories });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireAdmin, validate(storySchema), async (req, res, next) => {
  try {
    const story = await ShowcaseStory.create(req.body);
    res.status(201).json({ success: true, data: story });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, requireAdmin, validate(storySchema), async (req, res, next) => {
  try {
    const story = await ShowcaseStory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!story) return res.status(404).json({ success: false, message: 'Story not found.' });
    res.json({ success: true, data: story });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const story = await ShowcaseStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found.' });
    res.json({ success: true, message: 'Story deleted.' });
  } catch (error) { next(error); }
});

export default router;
