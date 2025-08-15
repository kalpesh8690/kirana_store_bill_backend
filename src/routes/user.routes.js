import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createUser, listUsers, getUser, updateUser, removeUser } from '../controllers/user.controller.js';

const router = express.Router();


router.use(authenticate, authorize(['admin']));
router.post('/', createUser);
router.get('/', listUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', removeUser);


export default router;
