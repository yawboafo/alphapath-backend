import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './errorHandler';
import db from '../config/database';

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);

      // Verify user still exists
      const { rows } = await db.query(
        'SELECT id, email, membership_tier FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (rows.length === 0) {
        throw new AppError('User not found', 401, 'UNAUTHORIZED');
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        membershipTier: decoded.membershipTier,
      };

      next();
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedTiers: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!allowedTiers.includes(req.user.membershipTier)) {
      throw new AppError(
        'You do not have permission to access this resource',
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};
