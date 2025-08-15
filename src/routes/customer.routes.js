import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as ctrl from '../controllers/customer.controller.js';
import { validate } from '../middleware/validate.js';
import { customerSchema } from '../validators/customer.schema.js';

const router = express.Router();

// All customer routes require authentication
router.use(authenticate);

// Customer CRUD operations
router.post('/', validate(customerSchema), ctrl.createCustomer);
router.get('/', ctrl.listCustomers);
router.get('/:id', ctrl.getCustomer);
router.put('/:id', validate(customerSchema), ctrl.updateCustomer);
router.delete('/:id', ctrl.removeCustomer);

// Additional customer operations
router.patch('/:id/toggle-status', ctrl.toggleCustomerStatus);

export default router;
