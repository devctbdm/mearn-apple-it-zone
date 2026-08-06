// backend/src/routes/paymentRoutes.js

import express from 'express';
import {
  initiatePayment,
  validatePayment,
  ipnListener,
  cancelPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.get('/validate', validatePayment);
router.post('/validate', validatePayment);
router.post('/ipn', ipnListener);
router.get('/cancel', cancelPayment);
router.post('/cancel', cancelPayment);

export default router;
