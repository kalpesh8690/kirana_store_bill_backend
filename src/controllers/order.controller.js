import { StatusCodes } from 'http-status-codes';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import Customer from '../models/Customer.js';

// Helper function to generate invoice number
function generateInvoiceNumber() {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}

export async function createOrder(req, res, next) {
  try {
    const { 
      items, 
      customer, 
      currency = 'USD', 
      generateInvoice = false,
      paymentMethod,
      paymentStatus = 'pending',
      amountPaid = 0,
      paymentNotes = ''
    } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, 'Order items required'));
    }
    
    // Build snapshots and totals
    let subtotal = 0;
    const snapshots = [];
    
    for (const i of items) {
      let productName, productSKU, unitPrice;
      
      if (i.customProduct) {
        // Handle custom product (not saved to DB)
        productName = i.name;
        productSKU = i.sku;
        unitPrice = Number(i.price);
        
        if (!productName || !productSKU || Number.isNaN(unitPrice)) {
          return next(new ApiError(StatusCodes.BAD_REQUEST, 'Custom product must have name, sku, and price'));
        }
      } else {
        // Handle regular product from database
        const p = await Product.findById(i.productId);
        if (!p) return next(new ApiError(StatusCodes.BAD_REQUEST, `Product ${i.productId} not found`));
        productName = p.name;
        productSKU = p.sku;
        unitPrice = Number(p.price);
      }
      
      const quantity = Number(i.quantity || 1);
      subtotal += quantity * unitPrice;
      
      snapshots.push({ 
        productId: i.customProduct ? null : i.productId, 
        productName, 
        productSKU, 
        quantity, 
        unitPrice,
        isCustomProduct: i.customProduct || false
      });
    }
    
    const taxAmount = Number(req.body.taxAmount || 0);
    const discountAmount = Number(req.body.discountAmount || 0);
    const total = subtotal + taxAmount - discountAmount;

    const order = await Order.create({ 
      customer, 
      items: snapshots, 
      subtotal, 
      taxAmount, 
      discountAmount, 
      total, 
      currency 
    });
    
    let invoice = null;
    let payment = null;
    
    // Generate invoice if requested
    if (generateInvoice) {
      invoice = await Invoice.create({
        order: order._id,
        invoiceNumber: generateInvoiceNumber(),
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentStatus: 'unpaid',
        amountPaid: 0,
        currency: order.currency
      });
    }
    
    // Create payment if payment details are provided
    if (paymentMethod && invoice) {
      payment = await Payment.create({
        invoice: invoice._id,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        amount: Number(amountPaid),
        method: paymentMethod,
        status: paymentStatus,
        notes: paymentNotes,
        paymentDate: new Date()
      });
      
      // Update invoice payment status and amount paid
      if (amountPaid > 0) {
        const newPaymentStatus = amountPaid >= total ? 'paid' : 'partial';
        await Invoice.findByIdAndUpdate(invoice._id, {
          amountPaid: Number(amountPaid),
          paymentStatus: newPaymentStatus
        });
      }
    }
    
    // Return order with invoice and payment info if generated
    const response = { order };
    if (invoice) {
      response.invoice = invoice;
    }
    if (payment) {
      response.payment = payment;
    }
    
    res.status(StatusCodes.CREATED).json(response);
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { ...(status ? { status } : {}) };
    const orders = await Order.find(filter).sort({ placedAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError(StatusCodes.NOT_FOUND, 'Order not found'));
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return next(new ApiError(StatusCodes.NOT_FOUND, 'Order not found'));
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function removeOrder(req, res, next) {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return next(new ApiError(StatusCodes.NOT_FOUND, 'Order not found'));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}

export async function getOrderForPrint(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ApiError(StatusCodes.NOT_FOUND, 'Order not found'));
    
    // Populate customer details
    const customer = await Customer.findById(order.customer).select('firstName lastName email phone address city state zip country');
    console.log(customer);
    if (!customer) return next(new ApiError(StatusCodes.NOT_FOUND, 'Customer not found'));
    
    // Get invoice details
    const invoice = await Invoice.findOne({ order: order._id });
    
    // Get payment history if invoice exists
    let payments = [];
    let totalPaid = 0;
    if (invoice) {
      payments = await Payment.find({ invoice: invoice._id }).sort({ paymentDate: -1 });
      totalPaid = payments.reduce((sum, payment) => {
        if (payment.status === 'success') {
          return sum + payment.amount;
        }
        return sum;
      }, 0);
    }
    
    // Format the response for printing
    const billData = {
      orderId: order._id,
      orderNumber: order._id.toString().slice(-8).toUpperCase(),
      orderDate: order.placedAt,
      status: order.status,
      
      // Customer Information
      customer: {
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        address: `${customer.address}, ${customer.city}, ${customer.state}, ${customer.zip}, ${customer.country}`
      },
      
      // Order Items
      items: order.items.map(item => ({
        productName: item.productName,
        productSKU: item.productSKU,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice
      })),
      
      // Financial Summary
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      currency: order.currency,
      
      // Invoice Information
      invoice: invoice ? {
        invoiceNumber: invoice.invoiceNumber,
        issuedDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        paymentStatus: invoice.paymentStatus,
        amountPaid: invoice.amountPaid,
        paymentMethod: invoice.paymentMethod
      } : null,
      
      // Payment Status & History
      paymentStatus: invoice ? invoice.paymentStatus : 'no_invoice',
      totalPaid: totalPaid,
      outstandingAmount: invoice ? (order.total - totalPaid) : order.total,
      isFullyPaid: invoice ? (totalPaid >= order.total) : false,
      
      // Payment History
      payments: payments.map(payment => ({
        transactionId: payment.transactionId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        paymentDate: payment.paymentDate,
        notes: payment.notes
      })),
      
      // Additional Details
      placedAt: order.placedAt,
      updatedAt: order.updatedAt
    };
    
    res.json(billData);
  } catch (err) {
    next(err);
  }
}
