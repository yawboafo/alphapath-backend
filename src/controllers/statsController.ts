import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { asyncHandler } from '../middleware/errorHandler';
import StatsService from '../services/statsService';

export class StatsController {
  // GET /api/stats/dashboard - Get admin dashboard overview statistics
  getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await StatsService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // GET /api/stats/recent-enrollments - Get recent enrollments
  getRecentEnrollments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const enrollments = await StatsService.getRecentEnrollments(limit);

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  });

  // GET /api/stats/top-courses - Get top performing courses
  getTopCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const courses = await StatsService.getTopCourses(limit);

    res.status(200).json({
      success: true,
      data: courses,
    });
  });
}

export default new StatsController();
