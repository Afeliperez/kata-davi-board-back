import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { EnvConfig } from '../../../config/env';

const env = EnvConfig.get();
const loginPath = `/${env.apiPath}/users/login`;

export const authMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  if (request.method === 'POST' && request.path === loginPath) {
    next();
    return;
  }

  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Token requerido' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    const err = error as Error;
    const isExpired = err.name === 'TokenExpiredError';

    response.status(401).json({
      error: isExpired ? 'Token vencido' : 'Token inválido'
    });
  }
};