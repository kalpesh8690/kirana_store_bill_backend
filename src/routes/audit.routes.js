import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { list } from '../controllers/audit.controller.js';

const router = express.Router();


router.use(authenticate, authorize(['admin']));
router.get('/', list);


export default router;
