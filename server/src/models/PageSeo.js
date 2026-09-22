import mongoose from 'mongoose';

const pageSeoSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    unique: true,
    enum: ['home', 'products', 'innovations', 'downloads', 'about', 'contact'],
  },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  keywords: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('PageSeo', pageSeoSchema);
