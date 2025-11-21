import { Router } from 'express';
import communityController from '../controllers/communityController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createPostSchema, createCommentSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/posts', communityController.getPosts);
router.get('/posts/:id', communityController.getPostById);
router.get('/posts/:id/comments', communityController.getPostComments);

// Protected routes
router.post('/posts', authenticate, validate(createPostSchema), communityController.createPost);
router.post('/posts/:id/like', authenticate, communityController.togglePostLike);
router.post(
  '/posts/:id/comments',
  authenticate,
  validate(createCommentSchema),
  communityController.createComment
);

export default router;
