import { StatusCodes } from 'http-status-codes';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';

function generateInvoiceNumber() {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}

export async function createInvoice(req, res, next) {
  try {
    const { order: orderId, dueDate } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return next(new ApiError(StatusCodes.BAD_REQUEST, 'Order not found'));
    const invoice = await Invoice.create({
      order: order._id,
      invoiceNumber: generateInvoiceNumber(),
      issuedDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      paymentStatus: 'unpaid',
      amountPaid: 0,
      currency: order.currency
    });
    res.status(StatusCodes.CREATED).json(invoice);
  } catch (err) {
    next(err);
  }
}

export async function listInvoices(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { ...(status ? { paymentStatus: status } : {}) };
    const invoices = await Invoice.find(filter).sort({ issuedDate: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return next(new ApiError(StatusCodes.NOT_FOUND, 'Invoice not found'));
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) return next(new ApiError(StatusCodes.NOT_FOUND, 'Invoice not found'));
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

export async function removeInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return next(new ApiError(StatusCodes.NOT_FOUND, 'Invoice not found'));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
