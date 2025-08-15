import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as ctrl from '../controllers/category.controller.js';

const router = express.Router();


router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

router.use(authenticate, authorize(['admin']));
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);


export default router;
