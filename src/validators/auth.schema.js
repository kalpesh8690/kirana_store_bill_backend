import { Joi, Segments } from 'celebrate';

export const registerSchema = {
  [Segments.BODY]: Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer','admin').optional()
  })
};

export const loginSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};
