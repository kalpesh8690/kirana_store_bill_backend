import { celebrate } from 'celebrate';

export const validate = (schema) => celebrate(schema, { abortEarly: false });
