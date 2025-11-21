import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { AppError } from './errorHandler';

// Admin role check middleware
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  // Check if user is admin (you can define admin logic here)
  // For now, checking if membership_tier is 'admin'
  if (req.user.membershipTier !== 'admin') {
    throw new AppError('Admin access required', 403, 'FORBIDDEN');
  }

  next();
};
