import { StatusCodes } from 'http-status-codes';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { ApiError } from '../utils/ApiError.js';

export async function createPayment(req, res, next) {
  try {
    const { invoice: invoiceId, transactionId, amount, method, status } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invoice not found'));

    const payment = await Payment.create({ invoice: invoice._id, transactionId, amount, method, status });
    // Update invoice paid amount + status
    const amountPaid = (invoice.amountPaid || 0) + amount;
    let paymentStatus = 'partial';
    if (amountPaid <= 0) paymentStatus = 'unpaid';
    // We don't have invoice total here; treat paid when status=success and explicit request sets it later
    if (status === 'success') paymentStatus = 'partial';
    await Invoice.findByIdAndUpdate(invoice._id, { amountPaid, paymentStatus }, { new: true });

    res.status(StatusCodes.CREATED).json(payment);
  } catch (err) {
    next(err);
  }
}

export async function listPayments(req, res, next) {
  try {
    const { page = 1, limit = 20, method } = req.query;
    const filter = { ...(method ? { method } : {}) };
    const payments = await Payment.find(filter).sort({ paymentDate: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json(payments);
  } catch (err) {
    next(err);
  }
}

export async function getPayment(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return next(new ApiError(StatusCodes.NOT_FOUND, 'Payment not found'));
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

export async function updatePayment(req, res, next) {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payment) return next(new ApiError(StatusCodes.NOT_FOUND, 'Payment not found'));
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

export async function removePayment(req, res, next) {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return next(new ApiError(StatusCodes.NOT_FOUND, 'Payment not found'));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
