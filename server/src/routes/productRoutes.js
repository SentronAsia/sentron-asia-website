import { Router } from 'express';
import Product from '../models/Product.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productSchema } from '../validators/schemas.js';

const router = Router();

// GET /api/products — Public: list with search/filters + pagination
router.get('/', async (req, res, next) => {
  try {
    const { q, category, brand, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }
    if (category) filter.categoryId = category;
    if (brand) filter.brandId = brand;

    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Map virtuals manually since populate overrides them
    const data = products.map((p) => ({
      ...p.toJSON(),
      category: p.categoryId ? { _id: p.categoryId._id, name: p.categoryId.name, slug: p.categoryId.slug } : null,
      brand: p.brandId ? { _id: p.brandId._id, name: p.brandId.name } : null,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/featured — Public: featured products
router.get('/featured', async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(12);

    const data = products.map((p) => ({
      ...p.toJSON(),
      category: p.categoryId ? { name: p.categoryId.name } : null,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:slug — Public: single product by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const data = {
      ...product.toJSON(),
      category: product.categoryId ? { _id: product.categoryId._id, name: product.categoryId.name } : null,
      brand: product.brandId ? { _id: product.brandId._id, name: product.brandId.name } : null,
    };

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/products — Admin: create
router.post('/', authenticate, requireAdmin, validate(productSchema), async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/products/:id — Admin: update
router.put('/:id', authenticate, requireAdmin, validate(productSchema), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/products/:id — Admin: delete
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;
