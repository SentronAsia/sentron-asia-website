import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/schemas.js';
import crypto from 'crypto';
import { sendEmail, buildResetPasswordEmail } from '../services/emailService.js';

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Always return success to prevent email enumeration
      return res.json({ success: true, message: 'If that email is registered, we have sent a reset link.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save({ validateBeforeSave: false });

    // Send email
    const origin = req.headers.origin || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const resetUrl = `${origin}/admin/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Sentron Asia CMS - Password Reset Request',
      html: buildResetPasswordEmail(resetUrl)
    });

    res.json({ success: true, message: 'If that email is registered, we have sent a reset link.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
});

export default router;
