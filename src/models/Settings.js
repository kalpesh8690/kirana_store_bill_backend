import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    description: { type: String, trim: true }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

export default mongoose.model('Settings', SettingsSchema);
