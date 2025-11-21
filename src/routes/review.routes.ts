import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import reviewController from '../controllers/reviewController';

const router = Router();

// Review routes
router.get('/:courseId/reviews', reviewController.getCourseReviews);
router.get('/:courseId/reviews/stats', reviewController.getReviewStats);
router.post('/:courseId/reviews', authenticate, reviewController.createReview);
router.put('/reviews/:reviewId', authenticate, reviewController.updateReview);
router.delete('/reviews/:reviewId', authenticate, reviewController.deleteReview);

export default router;
