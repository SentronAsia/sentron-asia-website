import { Router } from 'express';
import Document from '../models/Document.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { documentSchema } from '../validators/schemas.js';


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
    res.json({ success: true, url: targetUrl });
  } catch (error) { next(error); }
});

// POST — Admin: create document (supports multipart/form-data or JSON)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    let fileUrl = req.body.fileUrl || req.body.fileKey || '';
    let size = Number(req.body.size || req.body.fileSize) || 0;
    let fileType = req.body.fileType || req.body.type || '';

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const payload = {
      name: req.body.name || 'Untitled Document',
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
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = { ...req.body };

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
