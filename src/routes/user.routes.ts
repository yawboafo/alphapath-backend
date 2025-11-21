import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';
import { UserController } from '../controllers/userController';

const router = Router();
const userController = new UserController();

// User stats - Authenticated user only (must be before /:id to avoid conflict)
router.get('/stats', authenticate, userController.getUserStats);

// Admin routes - User management
router.get('/', authenticate, adminOnly, userController.getAllUsers);
router.get('/:id', authenticate, adminOnly, userController.getUserById);
router.put('/:id', authenticate, adminOnly, userController.updateUser);
router.delete('/:id', authenticate, adminOnly, userController.deleteUser);

export default router;
