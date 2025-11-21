import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/express';
import UserService from '../services/userService';
import { asyncHandler } from '../middleware/errorHandler';

export class UserController {
  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = '1', limit = '20', search = '', role = '' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await UserService.getAllUsers({
      page: pageNum,
      limit: limitNum,
      search: search as string,
      role: role as string,
    });

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    const response: ApiResponse = {
      success: true,
      data: { user },
    };

    res.status(200).json(response);
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = await UserService.updateUser(id, req.body);

    const response: ApiResponse = {
      success: true,
      data: { user },
      message: 'User updated successfully',
    };

    res.status(200).json(response);
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await UserService.deleteUser(id);

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    res.status(200).json(response);
  });

  getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const stats = await UserService.getUserStats(req.user.id);

    const response: ApiResponse = {
      success: true,
      data: { stats },
    };

    res.status(200).json(response);
  });
}

export default new UserController();
