import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadFile } from '../services/storageService.js';
import MediaLibrary from '../models/MediaLibrary.js';

const router = Router();

/**
 * POST /api/upload
 * Accepts multipart/form-data with single or multiple files buffered in RAM.
 * Streams files directly to Cloudinary / S3 (or fallback data URI in dev).
 */
router.post('/', upload.any(), async (req, res, next) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided. Please select at least one file.',
      });
    }

    const results = [];
    for (const file of files) {
      const uploaded = await uploadFile(file.buffer, {
        filename: file.originalname,
        mimeType: file.mimetype,
        folder: 'sentron-uploads',
      });

      // Optionally register in MediaLibrary collection
      let mediaDoc = null;
      try {
        mediaDoc = await MediaLibrary.create({
          filename: file.originalname,
          url: uploaded.url,
          publicId: uploaded.publicId || uploaded.key,
          size: file.size,
          mimeType: file.mimetype,
          altText: req.body.altText || file.originalname,
        });
      } catch (dbErr) {
        // Non-fatal if DB not yet connected in dev
      }

      results.push({
        url: uploaded.url,
        publicId: uploaded.publicId || uploaded.key,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        mediaId: mediaDoc?._id,
      });
    }

    res.status(201).json({
      success: true,
      url: results[0].url,
      urls: results.map((r) => r.url),
      data: results.length === 1 ? results[0] : results,
      count: results.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
