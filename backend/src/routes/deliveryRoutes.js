import express from 'express';
import {
  listDeliveries,
  getDelivery,
  createDelivery,
  updateDeliveryStatus,
  trackDelivery,
  pushDraft,
  pathaoStores,
  pathaoCities,
  pathaoZones,
  pathaoAreas,
} from '../controllers/deliveryController.js';
import {
  getPathaoConfig,
  updatePathaoConfig,
} from '../controllers/deliveryConfigController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Pathao config (admin) — backed by the DeliveryConfig model
router.get('/pathao/config', protect, adminOnly, getPathaoConfig);
router.put('/pathao/config', protect, adminOnly, updatePathaoConfig);

// Pathao lookups (any authenticated user — used for address autofill)
router.get('/pathao/stores', protect, adminOnly, pathaoStores);
router.get('/pathao/cities', protect, pathaoCities);
router.get('/pathao/cities/:cityId/zones', protect, pathaoZones);
router.get('/pathao/zones/:zoneId/areas', protect, adminOnly, pathaoAreas);

// Delivery CRUD
router.get('/', protect, adminOnly, listDeliveries);
router.post('/', protect, adminOnly, createDelivery);
router.get('/:id', protect, adminOnly, getDelivery);
router.put('/:id/status', protect, adminOnly, updateDeliveryStatus);
router.post('/:id/track', protect, adminOnly, trackDelivery);
router.post('/:id/push', protect, adminOnly, pushDraft);

export default router;
