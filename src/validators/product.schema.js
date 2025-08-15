import { Joi, Segments } from 'celebrate';

export const createProduct = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().max(200).required(),
    description: Joi.string().allow(''),
    sku: Joi.string().required(),
    category: Joi.string().hex().length(24),
    price: Joi.number().min(0).required(),
    stockQuantity: Joi.number().min(0).default(0)
  })
};
