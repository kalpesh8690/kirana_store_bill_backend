import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as ctrl from '../controllers/settings.controller.js';

const router = express.Router();


router.use(authenticate, authorize(['admin']));
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);


export default router;
