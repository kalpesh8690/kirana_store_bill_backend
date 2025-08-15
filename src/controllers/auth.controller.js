import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function register(req, res, next) {
  try {
    const { password, ...rest } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ ...rest, passwordHash });
    res.status(StatusCodes.CREATED).json({ id: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials'));
    const ok = await user.comparePassword(password);
    if (!ok) return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials'));
    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
}
