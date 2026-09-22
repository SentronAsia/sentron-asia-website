import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { contactSchema, enquirySchema } from '../validators/schemas.js';
import { sendEmail, buildContactEmail } from '../services/emailService.js';

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sentronasia@yahoo.com';

// POST /api/contact — Contact form submission
router.post('/', validate(contactSchema), async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const html = buildContactEmail({ name, email, phone, subject, message });

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Contact Form: ${subject || 'New Message'} — from ${name}`,
      html,
      replyTo: email,
    });

    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Email send failed:', error.message);
    // Don't expose email errors to client
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
  }
});

// POST /api/enquiry — Product enquiry form
router.post('/product', validate(enquirySchema), async (req, res, next) => {
  try {
    const { name, email, phone, message, product } = req.body;

    const html = buildContactEmail({ name, email, phone, message, product });

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Product Enquiry: ${product} — from ${name}`,
      html,
      replyTo: email,
    });

    res.json({ success: true, message: 'Enquiry sent successfully.' });
  } catch (error) {
    console.error('Enquiry email failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send enquiry. Please try again later.' });
  }
});

export default router;
