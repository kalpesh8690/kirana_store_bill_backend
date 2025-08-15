import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    phone: { type: String, required: true, trim: true, index: true },
    email: {
      type: String, 
      lowercase: true, 
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      sparse: true // Allows multiple null values but enforces uniqueness when present
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    country: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    notes: { type: String, trim: true } // For any additional customer notes
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

// Indexes for better query performance
CustomerSchema.index({ lastName: 1, firstName: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ email: 1 }, { sparse: true });
CustomerSchema.index({ isActive: 1, isDeleted: 1 });

// Virtual for full name
CustomerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
CustomerSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Customer', CustomerSchema);
