import { Joi, Segments } from 'celebrate';

export const createOrder = {
  [Segments.BODY]: Joi.object({
    customer: Joi.string().hex().length(24).required(),
    items: Joi.array().items(Joi.object({
      // For regular products
      productId: Joi.when('customProduct', {
        is: true,
        then: Joi.forbidden(),
        otherwise: Joi.string().hex().length(24).required()
      }),
      // For custom products
      customProduct: Joi.boolean().default(false),
      name: Joi.when('customProduct', {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      }),
      price: Joi.when('customProduct', {
        is: true,
        then: Joi.number().min(0).required(),
        otherwise: Joi.forbidden()
      }),
      sku: Joi.when('customProduct', {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      }),
      quantity: Joi.number().min(1).default(1)
    })).min(1).required(),
    taxAmount: Joi.number().min(0).default(0),
    discountAmount: Joi.number().min(0).default(0),
    currency: Joi.string().uppercase().length(3).default('USD'),
    generateInvoice: Joi.boolean().default(false),
    // Payment fields
    paymentMethod: Joi.when('generateInvoice', {
      is: true,
      then: Joi.string().valid('credit_card', 'paypal', 'bank_transfer', 'cash', 'other').optional(),
      otherwise: Joi.forbidden()
    }),
    paymentStatus: Joi.when('generateInvoice', {
      is: true,
      then: Joi.string().valid('success', 'failed', 'pending').default('pending'),
      otherwise: Joi.forbidden()
    }),
    amountPaid: Joi.when('generateInvoice', {
      is: true,
      then: Joi.number().min(0).default(0),
      otherwise: Joi.forbidden()
    }),
    paymentNotes: Joi.when('generateInvoice', {
      is: true,
      then: Joi.string().optional(),
      otherwise: Joi.forbidden()
    })
  })
};
