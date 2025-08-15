import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as ctrl from '../controllers/product.controller.js';
import { validate } from '../middleware/validate.js';
import { createProduct } from '../validators/product.schema.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });


router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

router.use(authenticate, authorize(['admin']));
router.post('/', validate(createProduct), ctrl.create);
router.post('/bulk-upload', upload.single('file'), ctrl.bulkUpload);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);


export default router;
