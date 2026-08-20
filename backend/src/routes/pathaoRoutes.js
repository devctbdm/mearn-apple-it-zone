import express from 'express';
import { handlePathaoWebhook } from '../controllers/pathaoWebhookController.js';

const router = express.Router();

// Pathao webhook callback. No session/CSRF — authenticated by webhook secret.
router.post('/webhook', handlePathaoWebhook);

export default router;
