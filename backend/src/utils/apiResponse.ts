import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({
    success: true,
    data,
    error: null,
  });
}

export function sendError(res: Response, message: string, status = 500): void {
  res.status(status).json({
    success: false,
    data: null,
    error: message,
  });
}
