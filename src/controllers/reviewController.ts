import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../middleware/errorHandler';
import ReviewService from '../services/reviewService';

export class ReviewController {
  // GET /api/courses/:courseId/reviews - Get all reviews for a course
  getCourseReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await ReviewService.getCourseReviews(courseId, page, limit);

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  });

  // POST /api/courses/:courseId/reviews - Create a review
  createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    const review = await ReviewService.createReview(courseId, userId, {
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  });

  // PUT /api/reviews/:reviewId - Update a review
  updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user!.id;

    const review = await ReviewService.updateReview(reviewId, userId, {
      rating,
      comment,
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  });

  // DELETE /api/reviews/:reviewId - Delete a review
  deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    await ReviewService.deleteReview(reviewId, userId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  });

  // GET /api/courses/:courseId/reviews/stats - Get review statistics
  getReviewStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { courseId } = req.params;
    const stats = await ReviewService.getReviewStats(courseId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export default new ReviewController();
