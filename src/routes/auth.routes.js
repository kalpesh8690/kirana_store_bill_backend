import express from 'express';
import { validate } from '../middleware/validate.js';
import { register, login } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../validators/auth.schema.js';

const router = express.Router();


router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);


export default router;
