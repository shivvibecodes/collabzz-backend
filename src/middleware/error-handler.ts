import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message: string | z.ZodIssue[] = 'Internal Server Error';

  if (err instanceof z.ZodError) {
    statusCode = 400;
    message = err.issues;
  } else if (err instanceof Error) {
    const appError = err as AppError;
    statusCode = appError.statusCode || 500;
    message = appError.message || 'Internal Server Error';
  }

  if (statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};
