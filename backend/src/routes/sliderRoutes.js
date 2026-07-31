import express from 'express';
import {
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
  reorderSliders,
} from '../controllers/sliderController.js';
import { uploadSliderImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllSliders);
router.get('/:id', getSliderById);

router.post('/', uploadSliderImage, createSlider);
router.put('/reorder', reorderSliders);
router.put('/:id', uploadSliderImage, updateSlider);
router.delete('/:id', deleteSlider);

export default router;
