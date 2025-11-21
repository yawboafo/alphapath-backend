import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';
import statsController from '../controllers/statsController';

const router = Router();

// Admin-only stats routes
router.get('/dashboard', authenticate, adminOnly, statsController.getDashboardStats);
router.get('/recent-enrollments', authenticate, adminOnly, statsController.getRecentEnrollments);
router.get('/top-courses', authenticate, adminOnly, statsController.getTopCourses);

export default router;
