import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as ctrl from '../controllers/order.controller.js';
import { validate } from '../middleware/validate.js';
import { createOrder } from '../validators/order.schema.js';

const router = express.Router();

router.get('/:id/print', ctrl.getOrderForPrint);
router.use(authenticate);
router.post('/', validate(createOrder), ctrl.createOrder);
router.get('/', ctrl.listOrders);
router.get('/:id', ctrl.getOrder);

router.put('/:id', ctrl.updateOrder);
router.delete('/:id', ctrl.removeOrder);


export default router;
