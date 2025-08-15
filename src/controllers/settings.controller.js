import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import Model from '../models/Settings.js';

export async function create(req, res, next) {
  try {
    const doc = await Model.create(req.body);
    res.status(StatusCodes.CREATED).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = q ? { $text: { $search: q } } : {};
    const docs = await Model.find(filter).skip((page-1)*limit).limit(Number(limit));
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const doc = await Model.findById(req.params.id);
    if (!doc) return next(new ApiError(StatusCodes.NOT_FOUND, 'Settings not found'));
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return next(new ApiError(StatusCodes.NOT_FOUND, 'Settings not found'));
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new ApiError(StatusCodes.NOT_FOUND, 'Settings not found'));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
