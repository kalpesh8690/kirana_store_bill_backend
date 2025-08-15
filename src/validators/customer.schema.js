import { Joi, Segments } from 'celebrate';

export const customerSchema = {
  [Segments.BODY]: Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    phone: Joi.string().required(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zip: Joi.string().optional(),
    country: Joi.string().optional(),
  })
};

