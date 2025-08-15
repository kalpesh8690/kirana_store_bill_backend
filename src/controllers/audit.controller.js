import AuditLog from '../models/AuditLog.js';

export async function list(req, res, next) {
	try {
		const { page = 1, limit = 50, entityType } = req.query;
		const filter = { ...(entityType ? { entityType } : {}) };
		const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
		res.json(logs);
	} catch (err) {
		next(err);
	}
}
