import express from 'express';
import { getCustomers, getCustomerById } from '../controllers/customerController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, getCustomers);
router.get('/:id', protect, adminOnly, getCustomerById);

export default router;
