import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Sentron Asia International',
  },
  contactEmail: {
    type: String,
    default: 'sentronasia@yahoo.com',
  },
  phoneNumbers: {
    type: String,
    default: '+92-42-35838165',
  },
  inquiryRouting: {
    type: String,
    default: 'sentronasia@yahoo.com',
  },
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.pre('save', async function (next) {
  const count = await mongoose.model('Settings').countDocuments();
  if (count > 0 && this.isNew) {
    return next(new Error('Only one Settings document can be created.'));
  }
  next();
});

export default mongoose.model('Settings', settingsSchema);
