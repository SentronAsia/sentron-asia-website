import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  fileKey: { type: String, default: '' },
  fileType: { type: String, default: 'PDF' },
  type: { type: String, default: 'PDF' },
  size: { type: Number, default: 0 },
  fileSize: { type: Number, default: 0 },
}, { timestamps: true });

documentSchema.pre('save', function (next) {
  if (this.fileUrl && !this.fileKey) this.fileKey = this.fileUrl;
  if (this.fileKey && !this.fileUrl) this.fileUrl = this.fileKey;
  if (this.fileType && !this.type) this.type = this.fileType;
  if (this.type && !this.fileType) this.fileType = this.type;
  if (this.size && !this.fileSize) this.fileSize = this.size;
  if (this.fileSize && !this.size) this.size = this.fileSize;
  next();
});

export default mongoose.model('Document', documentSchema);
