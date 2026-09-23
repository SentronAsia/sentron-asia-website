import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, trim: true, lowercase: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  specifications: {
    columns: [{ type: String }],
    rows: [{ type: mongoose.Schema.Types.Mixed }],
  },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual populate
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

productSchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brandId',
  foreignField: '_id',
  justOne: true,
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
