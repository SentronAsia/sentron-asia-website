import { Router } from 'express';
import Document from '../models/Document.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { documentSchema } from '../validators/schemas.js';
import { upload } from '../middleware/upload.js';
import { uploadFile, getSignedUrl } from '../services/storageService.js';

const router = Router();

// Helper to detect document type from filename / extension
function detectFileType(filename = '', mimetype = '') {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf') || mimetype.includes('pdf')) return 'PDF';
  if (lower.endsWith('.doc') || lower.endsWith('.docx') || mimetype.includes('word')) return 'Word';
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || mimetype.includes('sheet') || mimetype.includes('excel')) return 'Excel';
  if (lower.endsWith('.txt') || mimetype.includes('text/plain')) return 'Text';
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return 'Presentation';
  return 'Document';
}

// GET — Public: list documents
router.get('/', async (req, res, next) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json({ success: true, data: documents });
  } catch (error) { next(error); }
});

// GET /:id/download — Public: generate or return download URL
router.get('/:id/download', async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

    const targetUrl = doc.fileUrl || doc.fileKey;
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('data:'))) {
      return res.json({ success: true, url: targetUrl });
    }

    const url = await getSignedUrl(doc.fileKey || doc.fileUrl, 3600); // 1-hour expiry
    res.json({ success: true, url });
  } catch (error) { next(error); }
});

// POST — Admin: create document (supports multipart/form-data or JSON)
router.post('/', authenticate, requireAdmin, upload.single('document'), async (req, res, next) => {
  try {
    let fileUrl = req.body.fileUrl || req.body.fileKey || '';
    let size = Number(req.body.size || req.body.fileSize) || 0;
    let fileType = req.body.fileType || req.body.type || '';

    // If a local file was uploaded via multer
    if (req.file) {
      const detected = detectFileType(req.file.originalname, req.file.mimetype);
      if (!fileType) fileType = detected;

      const uploaded = await uploadFile(req.file.buffer, {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        resource_type: 'raw', // Cloudinary requirement for documents
        folder: 'sentron-documents',
      });

      fileUrl = uploaded.url;
      size = req.file.size;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const payload = {
      name: req.body.name || (req.file ? req.file.originalname.replace(/\.[^/.]+$/, '') : 'Untitled Document'),
      fileUrl,
      fileKey: fileUrl,
      fileType: fileType || 'PDF',
      type: fileType || 'PDF',
      size,
      fileSize: size,
    };

    const validated = documentSchema.parse(payload);
    const doc = await Document.create(validated);
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
});

// PUT /:id — Admin: update document
router.put('/:id', authenticate, requireAdmin, upload.single('document'), async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (req.file) {
      const detected = detectFileType(req.file.originalname, req.file.mimetype);
      payload.fileType = payload.fileType || detected;
      payload.type = payload.type || detected;

      const uploaded = await uploadFile(req.file.buffer, {
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        resource_type: 'raw',
        folder: 'sentron-documents',
      });

      payload.fileUrl = uploaded.url;
      payload.fileKey = uploaded.url;
      payload.size = req.file.size;
      payload.fileSize = req.file.size;
    }

    const validated = documentSchema.parse(payload);
    const doc = await Document.findByIdAndUpdate(req.params.id, validated, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
    res.json({ success: true, message: 'Document deleted.' });
  } catch (error) { next(error); }
});

export default router;
