import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    changes: mongoose.Schema.Types.Mixed,
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true, strict: 'throw', versionKey: 'version' }
);

export default mongoose.model('AuditLog', AuditLogSchema);
