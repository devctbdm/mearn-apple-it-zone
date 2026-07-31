// backend/src/routes/authRoutes.js
import express from 'express';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { getSessions, revokeSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.get('/me/sessions', protect, getSessions);
router.delete('/me/sessions/:id', protect, revokeSession);

export default router;
