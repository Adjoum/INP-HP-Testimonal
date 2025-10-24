import express from 'express';
import {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  toggleLikeTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getTestimonials)
  .post(protect, createTestimonial);

router.route('/:id')
  .get(getTestimonialById)
  .delete(protect, deleteTestimonial);

router.post('/:id/like', protect, toggleLikeTestimonial);

export default router;
