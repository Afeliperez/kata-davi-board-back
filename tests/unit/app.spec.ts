import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '@app';
import { EnvConfig } from '@config/env';

describe('createApp', () => {
  const env = EnvConfig.get();
  const apiBasePath = `/${env.apiPath}`;
  const validToken = jwt.sign({ sub: 'unit-user' }, env.jwtSecret, { expiresIn: '1h' });

  it('mounts provided controllers routes', async () => {
    const userController = {
      listAll: (_req: unknown, res: { status: (code: number) => { json: (payload: unknown) => void } }) =>
        res.status(200).json({ ok: 'users' }),
      login: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    const projectBoardController = {
      create: jest.fn(),
      listAll: (_req: unknown, res: { status: (code: number) => { json: (payload: unknown) => void } }) =>
        res.status(200).json({ ok: 'boards' }),
      listByAccessCode: jest.fn(),
      getByPro: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    const app = createApp({
      userController: userController as never,
      projectBoardController: projectBoardController as never
    });

    const usersResponse = await request(app)
      .get(`${apiBasePath}/users`)
      .set('Authorization', `Bearer ${validToken}`);
    const boardsResponse = await request(app)
      .get(`${apiBasePath}/project-boards`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(usersResponse.status).toBe(200);
    expect(usersResponse.body).toEqual({ ok: 'users' });
    expect(boardsResponse.status).toBe(200);
    expect(boardsResponse.body).toEqual({ ok: 'boards' });
  });

  it('keeps auth middleware active even without controllers', async () => {
    const app = createApp();

    const response = await request(app).get(`${apiBasePath}/users`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token requerido' });
  });
});
