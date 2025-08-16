import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true },
    sku: { type: String, required: true, unique: true, index: true },
    category: {  type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

ProductSchema.index({ category: 1, price: 1 });

export default mongoose.model('Product', ProductSchema);
