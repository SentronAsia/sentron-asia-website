import { Router } from 'express';
import Partner from '../models/Partner.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { partnerSchema } from '../validators/schemas.js';
import { upload } from '../middleware/upload.js';
import { uploadFile } from '../services/storageService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const partners = await Partner.find().sort({ order: 1 });
    res.json({ success: true, data: partners });
  } catch (error) { next(error); }
});

router.post('/', authenticate, requireAdmin, upload.array('logos', 20), async (req, res, next) => {
  try {
    let logos = [];
    if (req.body.logos) {
      logos = Array.isArray(req.body.logos) ? req.body.logos : [req.body.logos];
    } else if (req.body.logo) {
      logos = [req.body.logo];
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadFile(file.buffer, {
          filename: file.originalname,
          mimeType: file.mimetype,
          folder: 'sentron-partners',
        });
        logos.push(uploaded.url);
      }
    }

    req.body.logos = logos;
    if (logos.length > 0 && !req.body.logo) {
      req.body.logo = logos[0];
    }

    const validated = partnerSchema.parse(req.body);
    const partner = await Partner.create(validated);
    res.status(201).json({ success: true, data: partner });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, requireAdmin, upload.array('logos', 20), async (req, res, next) => {
  try {
    let logos = [];
    if (req.body.logos) {
      logos = Array.isArray(req.body.logos) ? req.body.logos : [req.body.logos];
    } else if (req.body.logo) {
      logos = [req.body.logo];
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadFile(file.buffer, {
          filename: file.originalname,
          mimeType: file.mimetype,
          folder: 'sentron-partners',
        });
        logos.push(uploaded.url);
      }
    }

    if (logos.length > 0) {
      req.body.logos = logos;
      req.body.logo = logos[0];
    }

    const validated = partnerSchema.parse(req.body);
    const partner = await Partner.findByIdAndUpdate(req.params.id, validated, { new: true, runValidators: true });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    res.json({ success: true, data: partner });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    res.json({ success: true, message: 'Partner deleted.' });
  } catch (error) { next(error); }
});

export default router;
