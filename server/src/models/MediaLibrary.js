import mongoose from 'mongoose';

const mediaLibrarySchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  altText: { type: String, default: '' },
  size: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('MediaLibrary', mediaLibrarySchema);
