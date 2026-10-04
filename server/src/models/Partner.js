import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  logos: [{ type: String }],
  url: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

partnerSchema.pre('save', function () {
  if (this.logos && this.logos.length > 0 && !this.logo) {
    this.logo = this.logos[0];
  } else if (this.logo && (!this.logos || this.logos.length === 0)) {
    this.logos = [this.logo];
  }
});

export default mongoose.model('Partner', partnerSchema);
