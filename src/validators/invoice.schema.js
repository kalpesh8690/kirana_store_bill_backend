import { Joi, Segments } from 'celebrate';

export const createInvoice = {
  [Segments.BODY]: Joi.object({
    order: Joi.string().hex().length(24).required(),
    dueDate: Joi.date().optional()
  })
};
