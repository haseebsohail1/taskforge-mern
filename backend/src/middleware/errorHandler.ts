import { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const details = err instanceof AppError ? err.details : undefined;

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};
