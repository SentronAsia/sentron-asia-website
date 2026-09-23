import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Seed initial admin user.
 * Run: npm run seed
 */
async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const adminEmail = process.env.ADMIN_EMAIL || 'sentronasia@yahoo.com';
  const defaultPassword = process.env.ADMIN_PASSWORD || '36672209SentronAsia@';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    existing.password = defaultPassword;
    existing.role = 'admin';
    existing.mustChangePassword = false;
    await existing.save();
    console.log(`✓ Admin user updated: ${adminEmail}`);
  } else {
    await User.create({
      email: adminEmail,
      password: defaultPassword,
      role: 'admin',
      mustChangePassword: false,
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  }

  await mongoose.disconnect();
  console.log('✓ Done');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
