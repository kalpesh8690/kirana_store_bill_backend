import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

DiscountSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export default mongoose.model('Discount', DiscountSchema);
