import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Auth token missing'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token'));
  }
}

export function authorize(roles = []) {
  return async (req, res, next) => {
    const userId = req.user?.sub;
    const user = await User.findById(userId);
    if (!user) return next(new ApiError(StatusCodes.UNAUTHORIZED, 'User not found'));
    if (roles.length && !roles.includes(user.role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden'));
    }
    next();
  };
}
