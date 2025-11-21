import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/express';
import authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, fullName } = req.body;

    const result = await authService.register({ email, password, fullName });

    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
      message: 'Registration successful',
    };

    res.status(201).json(response);
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
      message: 'Login successful',
    };

    res.status(200).json(response);
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const user = await authService.getUserById(req.user.id);

    const response: ApiResponse = {
      success: true,
      data: { user },
    };

    res.status(200).json(response);
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const { fullName, avatarUrl } = req.body;

    const user = await authService.updateUser(req.user.id, { fullName, avatarUrl });

    const response: ApiResponse = {
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    };

    res.status(200).json(response);
  });

  logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
    // In a production app, you would invalidate the refresh token here
    // by adding it to a blacklist in Redis or the database

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  });
}

export default new AuthController();
