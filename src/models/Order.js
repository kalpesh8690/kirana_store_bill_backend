import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    productName: { type: String, required: true },
    productSKU: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    isCustomProduct: { type: Boolean, default: false }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], validate: v => Array.isArray(v) && v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'cancelled', 'refunded'], default: 'pending', index: true },
    placedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

OrderSchema.index({ customer: 1, placedAt: -1 });
OrderSchema.index({ status: 1, placedAt: -1 });

export default mongoose.model('Order', OrderSchema);
