import mongoose from 'mongoose';

const ShippingSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    carrier: { type: String, required: true },
    trackingNumber: { type: String, unique: true, sparse: true },
    shippedDate: { type: Date },
    estimatedDelivery: { type: Date },
    deliveryStatus: { type: String, enum: ['pending', 'in_transit', 'delivered', 'failed'], default: 'pending' }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

export default mongoose.model('Shipping', ShippingSchema);
