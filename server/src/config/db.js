import mongoose from 'mongoose';

/**
 * Lazy MongoDB connection handler.
 *
 * On Vercel serverless, each function invocation may be a cold start OR a
 * warm reuse of an existing container. Mongoose caches its connection on
 * the `mongoose` singleton, so we check readyState before reconnecting.
 *
 * readyState values:
 *   0 = disconnected
 *   1 = connected
 *   2 = connecting
 *   3 = disconnecting
 */
export const connectDB = async () => {
  // Already connected — reuse (warm serverless invocation)
  if (mongoose.connection.readyState === 1) return;

  // Currently connecting — wait for it to finish
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', resolve);
    });
    if (mongoose.connection.readyState === 1) return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};
