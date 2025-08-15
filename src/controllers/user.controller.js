import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function createUser(req, res, next) {
  try {
    const { password, ...rest } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ ...rest, passwordHash });
    res.status(StatusCodes.CREATED).json(user);
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const filter = { ...(role ? { role } : {}) };
    const users = await User.find(filter).skip((page-1)*limit).limit(Number(limit));
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(StatusCodes.NOT_FOUND, 'User not found'));
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { password, ...rest } = req.body;
    if (password) rest.passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true });
    if (!user) return next(new ApiError(StatusCodes.NOT_FOUND, 'User not found'));
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function removeUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new ApiError(StatusCodes.NOT_FOUND, 'User not found'));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
