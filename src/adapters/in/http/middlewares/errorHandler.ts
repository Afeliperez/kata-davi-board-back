import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
): void => {
  void next;

  const message = error instanceof Error ? error.message : 'Internal server error';

  response.status(500).json({
    error: message
  });
};