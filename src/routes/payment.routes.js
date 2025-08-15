import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as ctrl from '../controllers/payment.controller.js';
import { validate } from '../middleware/validate.js';
import { createPayment } from '../validators/payment.schema.js';

const router = express.Router();


router.use(authenticate);
router.post('/', validate(createPayment), ctrl.createPayment);
router.get('/', ctrl.listPayments);
router.get('/:id', ctrl.getPayment);
router.put('/:id', ctrl.updatePayment);
router.delete('/:id', ctrl.removePayment);


export default router;
