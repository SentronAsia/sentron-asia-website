import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Retry once after 3 seconds
    console.log('Retrying connection in 3 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      await mongoose.connect(MONGODB_URI);
      isConnected = true;
      console.log('✓ MongoDB connected on retry');
    } catch (retryError) {
      console.error('MongoDB retry failed:', retryError.message);
      throw retryError;
    }
  }
};
