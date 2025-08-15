import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'overdue', 'partial'], default: 'unpaid', index: true },
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer', 'cash', 'other'] },
    amountPaid: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

InvoiceSchema.index({ paymentStatus: 1, issuedDate: -1 });

export default mongoose.model('Invoice', InvoiceSchema);
