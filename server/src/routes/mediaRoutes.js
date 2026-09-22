import { Router } from 'express';
import MediaLibrary from '../models/MediaLibrary.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mediaUpdateSchema } from '../validators/schemas.js';
import { upload } from '../middleware/upload.js';
import { uploadFile, deleteFile } from '../services/storageService.js';

const router = Router();

// GET — Admin: list media with optional search
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { altText: { $regex: search, $options: 'i' } },
      ];
    }
    const media = await MediaLibrary.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: media });
  } catch (error) { next(error); }
});

// POST /upload — Admin: upload files (max 10)
router.post('/upload', authenticate, requireAdmin, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided.' });
    }

    const results = [];
    for (const file of req.files) {
      const uploaded = await uploadFile(file.buffer, {
        filename: file.originalname,
        mimeType: file.mimetype,
        folder: 'sentron-media',
      });

      const media = await MediaLibrary.create({
        filename: file.originalname,
        url: uploaded.url,
        publicId: uploaded.publicId || uploaded.key,
        size: file.size,
        mimeType: file.mimetype,
      });

      results.push(media);
    }

    res.status(201).json({ success: true, data: results });
  } catch (error) { next(error); }
});

// PUT /:id — Admin: update alt text
router.put('/:id', authenticate, requireAdmin, validate(mediaUpdateSchema), async (req, res, next) => {
  try {
    const media = await MediaLibrary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!media) return res.status(404).json({ success: false, message: 'Media not found.' });
    res.json({ success: true, data: media });
  } catch (error) { next(error); }
});

// DELETE /:id — Admin: delete from cloud + DB
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const media = await MediaLibrary.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media not found.' });

    // Delete from cloud storage
    try {
      await deleteFile(media.publicId);
    } catch (cloudErr) {
      console.error('Cloud delete failed (proceeding with DB delete):', cloudErr.message);
    }

    await MediaLibrary.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media deleted.' });
  } catch (error) { next(error); }
});

export default router;
