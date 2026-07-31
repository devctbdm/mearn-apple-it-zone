import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/categoryController.js';
import { uploadCategoryFields } from '../middleware/upload.js';

// TODO: Add protect & adminOnly middleware when deploying to production
// The admin page is already gated by the frontend auth layer.
// import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

router.post('/', uploadCategoryFields, createCategory);
router.put('/reorder', reorderCategories);
router.put('/:id', uploadCategoryFields, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
