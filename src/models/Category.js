import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

CategorySchema.index({ parent: 1, name: 1 });

export default mongoose.model('Category', CategorySchema);
