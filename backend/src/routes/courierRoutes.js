import express from 'express';
import {
  listCouriers,
  createCourier,
  updateCourier,
  deleteCourier,
  assignCourier,
} from '../controllers/courierController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, listCouriers);
router.post('/', protect, adminOnly, createCourier);
router.put('/:id', protect, adminOnly, updateCourier);
router.delete('/:id', protect, adminOnly, deleteCourier);

// Assign a courier to an order (lives under orders, but handled here).
// Export assignCourier and mount it in orderRoutes.

export { assignCourier };
export default router;
