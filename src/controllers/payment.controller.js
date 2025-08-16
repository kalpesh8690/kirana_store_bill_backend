import { StatusCodes } from 'http-status-codes';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';

export async function createPayment(req, res, next) {
  try {
    const { invoice: invoiceId, transactionId, amount, method, status } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return next(new ApiError(StatusCodes.BAD_REQUEST, 'Invoice not found'));

    const payment = await Payment.create({ invoice: invoice._id, transactionId, amount, method, status });
    
    // Get all payments for this invoice including the new one
    const payments = await Payment.find({ invoice: invoice._id });
    const totalPaid = payments.reduce((sum, p) => {
      if (p.status === 'success') {
        return sum + p.amount;
      }
      return sum;
    }, 0);
    
    // Get the order to compare total amount
    const order = await Order.findById(invoice.order);
    if (!order) return next(new ApiError(StatusCodes.BAD_REQUEST, 'Order not found'));
    
    // Determine payment status
    let paymentStatus = 'unpaid';
    if (totalPaid > 0) {
      paymentStatus = totalPaid >= order.total ? 'paid' : 'partial';
      
      // Update order status if payment is complete
      if (paymentStatus === 'paid' && order.status === 'pending') {
        await Order.findByIdAndUpdate(order._id, { status: 'paid' });
      }
    }
    
    // Update invoice
    await Invoice.findByIdAndUpdate(invoice._id, { 
      amountPaid: totalPaid, 
      paymentStatus 
    }, { new: true });

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
    
    // Update invoice payment status and amount paid
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      // Get all payments for this invoice
      const payments = await Payment.find({ invoice: invoice._id });
      const totalPaid = payments.reduce((sum, p) => {
        if (p.status === 'success') {
          return sum + p.amount;
        }
        return sum;
      }, 0);
      
      // Update invoice payment status
      let paymentStatus = 'unpaid';
      if (totalPaid > 0) {
        // Get order to compare total amount
        const order = await Order.findById(invoice.order);
        if (order) {
          paymentStatus = totalPaid >= order.total ? 'paid' : 'partial';
          
          // Update order status if payment is complete
          if (paymentStatus === 'paid' && order.status === 'pending') {
            await Order.findByIdAndUpdate(order._id, { status: 'paid' });
          }
        } else {
          paymentStatus = 'partial';
        }
      }
      
      // Update invoice
      await Invoice.findByIdAndUpdate(invoice._id, {
        amountPaid: totalPaid,
        paymentStatus
      });
    }
    
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

export async function removePayment(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return next(new ApiError(StatusCodes.NOT_FOUND, 'Payment not found'));
    
    // Store invoice ID before deleting payment
    const invoiceId = payment.invoice;
    
    // Delete the payment
    await Payment.findByIdAndDelete(req.params.id);
    
    // Update invoice payment status and amount paid
    const invoice = await Invoice.findById(invoiceId);
    if (invoice) {
      // Get all remaining payments for this invoice
      const payments = await Payment.find({ invoice: invoice._id });
      const totalPaid = payments.reduce((sum, p) => {
        if (p.status === 'success') {
          return sum + p.amount;
        }
        return sum;
      }, 0);
      
      // Update invoice payment status
      let paymentStatus = 'unpaid';
      if (totalPaid > 0) {
        // Get order to compare total amount
        const order = await Order.findById(invoice.order);
        if (order) {
          paymentStatus = totalPaid >= order.total ? 'paid' : 'partial';
          
          // Update order status based on payment status
          if (paymentStatus !== 'paid' && order.status === 'paid') {
            await Order.findByIdAndUpdate(order._id, { status: 'pending' });
          }
        } else {
          paymentStatus = 'partial';
        }
      }
      
      // Update invoice
      await Invoice.findByIdAndUpdate(invoice._id, {
        amountPaid: totalPaid,
        paymentStatus
      });
    }
    
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
