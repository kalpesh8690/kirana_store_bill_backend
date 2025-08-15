import { StatusCodes } from 'http-status-codes';
import Customer from '../models/Customer.js';
import { ApiError } from '../utils/ApiError.js';

export async function createCustomer(req, res, next) {
  try {
    const customer = await Customer.create(req.body);
    res.status(StatusCodes.CREATED).json(customer);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern?.email) {
      return next(new ApiError(StatusCodes.CONFLICT, 'Email already exists'));
    }
    next(err);
  }
}

export async function listCustomers(req, res, next) {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    
    // Build filter
    const filter = { isDeleted: false };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    
    const customers = await Customer.find(filter)
      .sort({ lastName: 1, firstName: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Customer.countDocuments(filter);
    
    res.json({
      customers,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    if (!customer) return next(new ApiError(StatusCodes.NOT_FOUND, 'Customer not found'));
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return next(new ApiError(StatusCodes.NOT_FOUND, 'Customer not found'));
    res.json(customer);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000 && err.keyPattern?.email) {
      return next(new ApiError(StatusCodes.CONFLICT, 'Email already exists'));
    }
    next(err);
  }
}

export async function removeCustomer(req, res, next) {
  try {
    // Soft delete - mark as deleted instead of removing
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );
    if (!customer) return next(new ApiError(StatusCodes.NOT_FOUND, 'Customer not found'));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}

export async function toggleCustomerStatus(req, res, next) {
  try {
    const customer = await Customer.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    if (!customer) return next(new ApiError(StatusCodes.NOT_FOUND, 'Customer not found'));
    
    customer.isActive = !customer.isActive;
    await customer.save();
    
    res.json(customer);
  } catch (err) {
    next(err);
  }
}
