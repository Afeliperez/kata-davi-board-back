import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '@adapters/in/http/middlewares/authMiddleware';

jest.mock('jsonwebtoken');

const createResponseMock = (): Response => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);

  return response;
};

describe('authMiddleware', () => {
  let response: Response;
  let next: NextFunction;

  beforeEach(() => {
    response = createResponseMock();
    next = jest.fn();
  });

  it('allows OPTIONS requests without token', () => {
    authMiddleware({ method: 'OPTIONS' } as Request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('allows login route without token', () => {
    authMiddleware({ method: 'POST', path: '/kata-api/users/login' } as Request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 401 when authorization header is missing', () => {
    authMiddleware({ method: 'GET', headers: {} } as Request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Token requerido' });
  });

  it('returns 401 when token is expired', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      const error = new Error('expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    authMiddleware(
      { method: 'GET', headers: { authorization: 'Bearer expired-token' } } as unknown as Request,
      response,
      next
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Token vencido' });
  });

  it('returns 401 when token is invalid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    authMiddleware(
      { method: 'GET', headers: { authorization: 'Bearer invalid-token' } } as unknown as Request,
      response,
      next
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });

  it('calls next when token is valid', () => {
    (jwt.verify as jest.Mock).mockReturnValue({});

    authMiddleware(
      { method: 'GET', headers: { authorization: 'Bearer valid-token' } } as unknown as Request,
      response,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
  });
});
