import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/express';
import communityService from '../services/communityService';
import { asyncHandler } from '../middleware/errorHandler';

export class CommunityController {
  getPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { category } = req.query;

    const posts = await communityService.getPosts(category as string | undefined);

    const response: ApiResponse = {
      success: true,
      data: { posts },
    };

    res.status(200).json(response);
  });

  getPostById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const post = await communityService.getPostById(id);

    const response: ApiResponse = {
      success: true,
      data: { post },
    };

    res.status(200).json(response);
  });

  createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { category, title, content } = req.body;

    const post = await communityService.createPost(req.user.id, {
      category,
      title,
      content,
    });

    const response: ApiResponse = {
      success: true,
      data: { post },
      message: 'Post created successfully',
    };

    res.status(201).json(response);
  });

  togglePostLike = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = req.params;

    const result = await communityService.togglePostLike(req.user.id, id);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: result.liked ? 'Post liked' : 'Post unliked',
    };

    res.status(200).json(response);
  });

  getPostComments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const comments = await communityService.getPostComments(id);

    const response: ApiResponse = {
      success: true,
      data: { comments },
    };

    res.status(200).json(response);
  });

  createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { id } = req.params;
    const { content } = req.body;

    const comment = await communityService.createComment(req.user.id, id, content);

    const response: ApiResponse = {
      success: true,
      data: { comment },
      message: 'Comment added successfully',
    };

    res.status(201).json(response);
  });
}

export default new CommunityController();
