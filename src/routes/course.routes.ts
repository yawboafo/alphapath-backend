import { Router } from 'express';
import courseController from '../controllers/courseController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { updateProgressSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected routes - Course Management
router.post('/', authenticate, courseController.createCourse);
router.put('/:id', authenticate, courseController.updateCourse);
router.delete('/:id', authenticate, courseController.deleteCourse);

// Protected routes - User Enrollment & Progress
router.get('/:id/lessons', authenticate, courseController.getCourseLessons);
router.post('/:id/enroll', authenticate, courseController.enrollInCourse);
router.get('/my-courses', authenticate, courseController.getUserCourses);
router.get('/:id/progress', authenticate, courseController.getCourseProgress);
router.post(
  '/lessons/:id/progress',
  authenticate,
  validate(updateProgressSchema),
  courseController.updateLessonProgress
);

export default router;
