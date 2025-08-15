import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as ctrl from '../controllers/invoice.controller.js';
import { validate } from '../middleware/validate.js';
import { createInvoice } from '../validators/invoice.schema.js';

const router = express.Router();


router.use(authenticate);
router.post('/', validate(createInvoice), ctrl.createInvoice);
router.get('/', ctrl.listInvoices);
router.get('/:id', ctrl.getInvoice);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.removeInvoice);


export default router;
