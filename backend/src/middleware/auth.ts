import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User';
import { UnauthorizedError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid token'));
  }

  const token = header.split(' ')[1];
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select('tokenVersion role');
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return next(new UnauthorizedError('Token is invalid or expired'));
    }
    req.user = payload;
    return next();
  } catch (error) {
    return next(new UnauthorizedError('Token is invalid or expired'));
  }
};
