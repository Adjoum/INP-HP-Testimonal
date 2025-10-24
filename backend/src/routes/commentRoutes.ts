import express from 'express';
import {
  createComment,
  getCommentsByTestimonial,
  toggleLikeComment,
  deleteComment,
} from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/testimonial/:testimonialId', getCommentsByTestimonial);
router.post('/:id/like', protect, toggleLikeComment);
router.delete('/:id', protect, deleteComment);

export default router;
