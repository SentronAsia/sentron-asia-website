import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  heading: { type: String, default: '' },
  body: { type: String, default: '' },
  image: { type: String, default: '' },
  alignment: { type: String, enum: ['left', 'right'], default: 'left' },
}, { _id: false });

const showcaseStorySchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  title: { type: String, required: true, trim: true },
  coverImage: { type: String, default: '' },
  researcherName: { type: String, default: '' },
  institution: { type: String, default: '' },
  studyTitle: { type: String, default: '' },
  applicationField: { type: String, default: '' },
  abstract: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  sections: [sectionSchema],
}, { timestamps: true });

showcaseStorySchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brandId',
  foreignField: '_id',
  justOne: true,
});

showcaseStorySchema.set('toJSON', { virtuals: true });
showcaseStorySchema.set('toObject', { virtuals: true });

export default mongoose.model('ShowcaseStory', showcaseStorySchema);
