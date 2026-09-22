import nodemailer from 'nodemailer';

/**
 * Dual-provider email service.
 * Set EMAIL_PROVIDER=nodemailer|posttodev in .env
 */

async function sendViaNodemailer({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@sentronasia.com',
    to,
    subject,
    html,
  });
}

async function sendViaPostToDev({ to, subject, html, replyTo }) {
  const endpoint = process.env.POSTTODEV_ENDPOINT;
  if (!endpoint) throw new Error('POSTTODEV_ENDPOINT is not set');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html, replyTo }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PostTo.dev failed (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Send an email using the configured provider.
 */
export async function sendEmail({ to, subject, html, replyTo }) {
  const provider = process.env.EMAIL_PROVIDER || 'posttodev';

  if (provider === 'nodemailer') {
    return sendViaNodemailer({ to, subject, html });
  }

  return sendViaPostToDev({ to, subject, html, replyTo });
}

/**
 * Build HTML for a contact/enquiry form submission.
 */
export function buildContactEmail({ name, email, phone, subject, message, product }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a5c5c;">${product ? 'Product Enquiry' : 'Contact Form Submission'}</h2>
      ${product ? `<p><strong>Product:</strong> ${product}</p>` : ''}
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
        ${phone ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>` : ''}
        ${subject ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Subject</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${subject}</td></tr>` : ''}
      </table>
      <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
      <p style="margin-top: 16px; font-size: 12px; color: #999;">Sent from Sentron Asia International website</p>
    </div>
  `;
}

/**
 * Build HTML for a password reset email.
 */
export function buildResetPasswordEmail(resetUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #1a5c5c;">Password Reset Request</h2>
      <p>You requested a password reset for your Sentron Asia CMS admin account.</p>
      <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1a5c5c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #666;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">Sent from Sentron Asia International CMS</p>
    </div>
  `;
}
