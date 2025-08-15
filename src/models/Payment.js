import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    transactionId: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now },
    method: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer', 'cash', 'other'], required: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending', index: true },
    notes: { type: String, trim: true }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

PaymentSchema.index({ method: 1, paymentDate: -1 });

export default mongoose.model('Payment', PaymentSchema);
