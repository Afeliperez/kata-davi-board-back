import { Request, Response } from 'express';
import { errorHandler } from '@adapters/in/http/middlewares/errorHandler';

describe('errorHandler', () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  } as unknown as Response;

  it('returns error message when receives Error instance', () => {
    errorHandler(new Error('boom'), {} as Request, response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'boom' });
  });

  it('returns generic message when receives unknown error type', () => {
    errorHandler('boom' as unknown, {} as Request, response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
