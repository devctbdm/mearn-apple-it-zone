import express from 'express';
import {
  initiatePayment,
  validatePayment,
  ipnListener,
  cancelPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ---- Public endpoints (SSLCommerz calls these) ----
router.post('/initiate', protect, initiatePayment); // start payment session
router.post('/validate', validatePayment); // success redirect
router.post('/ipn', ipnListener); // IPN listener (no auth)
router.get('/cancel', cancelPayment); // cancel redirect

export default router;
