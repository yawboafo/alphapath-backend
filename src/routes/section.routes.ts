import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import sectionController from '../controllers/sectionController';

const router = Router();

// Section routes
router.get('/courses/:courseId/sections', authenticate, sectionController.getCourseSections);
router.post('/courses/:courseId/sections', authenticate, sectionController.createSection);
router.put('/sections/:sectionId', authenticate, sectionController.updateSection);
router.delete('/sections/:sectionId', authenticate, sectionController.deleteSection);

export default router;
