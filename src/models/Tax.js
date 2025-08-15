import mongoose from 'mongoose';

const TaxSchema = new mongoose.Schema(
  {
    region: { type: String, required: true, index: true },
    rate: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

export default mongoose.model('Tax', TaxSchema);
