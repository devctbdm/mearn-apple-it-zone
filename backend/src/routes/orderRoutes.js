import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders, // admin only
  updateOrderStatus, // admin only
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ---- Protected routes (authenticated users) ----
router.post('/', protect, createOrder); // place an order
router.get('/my-orders', protect, getMyOrders); // get logged‑in user’s orders
router.get('/:id', protect, getOrderById); // get specific order (user or admin)

// ---- Admin-only routes ----
router.get('/', protect, adminOnly, getAllOrders); // list all orders
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
