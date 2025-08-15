import { Joi, Segments } from 'celebrate';

export const createPayment = {
  [Segments.BODY]: Joi.object({
    invoice: Joi.string().hex().length(24).required(),
    transactionId: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    method: Joi.string().valid('credit_card','paypal','bank_transfer','cash','other').required(),
    status: Joi.string().valid('success','failed','pending').default('pending')
  })
};
