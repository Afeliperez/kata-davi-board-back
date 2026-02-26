import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '@app';
import { EnvConfig } from '@config/env';
import { Role, ICreateUser, IUser } from '@domain/entities/User';
import {
  ICreateProjectBoard,
  IProjectBoard,
  IUpdateProjectBoard
} from '@domain/entities/ProjectBoard';
import { IUserInputPort, ILoginResult } from '@application/ports/in/userInputPort';
import { IProjectBoardInputPort } from '@application/ports/in/projectBoardInputPort';
import { UserController } from '@adapters/in/http/controllers/userController';
import { ProjectBoardController } from '@adapters/in/http/controllers/projectBoardController';

const env = EnvConfig.get();
const apiBasePath = `/${env.apiPath}`;

const createValidToken = (): string => jwt.sign({ sub: 'e2e-user' }, env.jwtSecret, { expiresIn: '1h' });
const createExpiredToken = (): string =>
  jwt.sign({ sub: 'e2e-user' }, env.jwtSecret, { expiresIn: '-1s' });

const createUserUseCaseMock = (): jest.Mocked<IUserInputPort> => ({
  create: jest.fn<Promise<void>, [ICreateUser]>(),
  listAll: jest.fn<Promise<IUser[]>, []>(),
  login: jest.fn<Promise<ILoginResult | null>, [string, string]>(),
  update: jest.fn<Promise<IUser | null>, [string, Partial<ICreateUser>]>(),
  delete: jest.fn<Promise<void>, [string]>()
});

const createProjectBoardUseCaseMock = (): jest.Mocked<IProjectBoardInputPort> => ({
  create: jest.fn<Promise<void>, [ICreateProjectBoard]>(),
  listAll: jest.fn<Promise<IProjectBoard[]>, []>(),
  listByAccessCode: jest.fn<Promise<IProjectBoard[]>, [string]>(),
  getByPro: jest.fn<Promise<IProjectBoard | null>, [string]>(),
  update: jest.fn<Promise<IProjectBoard | null>, [string, IUpdateProjectBoard]>(),
  delete: jest.fn<Promise<void>, [string]>()
});

describe('API E2E', () => {
  const sampleUser: IUser = {
    cc: '10001',
    email: 'qa@kata.com',
    userName: 'qa-user',
    role: Role.QA
  };

  const sampleProjectBoard: IProjectBoard = {
    pro: 'PRO-1',
    projectName: 'Proyecto Uno',
    hu: [
      {
        hu: 'HU-1',
        descripcion: 'Historia inicial',
        status: 'TODO',
        codigo: 'C-1'
      }
    ],
    accesos: ['ADMIN']
  };

  let userUseCase: jest.Mocked<IUserInputPort>;
  let projectBoardUseCase: jest.Mocked<IProjectBoardInputPort>;

  const buildApp = () =>
    createApp({
      userController: new UserController(userUseCase),
      projectBoardController: new ProjectBoardController(projectBoardUseCase)
    });

  beforeEach(() => {
    userUseCase = createUserUseCaseMock();
    projectBoardUseCase = createProjectBoardUseCaseMock();

    userUseCase.create.mockResolvedValue(undefined);
    userUseCase.listAll.mockResolvedValue([sampleUser]);
    userUseCase.login.mockResolvedValue({ user: sampleUser, token: createValidToken() });
    userUseCase.update.mockResolvedValue(sampleUser);
    userUseCase.delete.mockResolvedValue(undefined);

    projectBoardUseCase.create.mockResolvedValue(undefined);
    projectBoardUseCase.listAll.mockResolvedValue([sampleProjectBoard]);
    projectBoardUseCase.listByAccessCode.mockResolvedValue([sampleProjectBoard]);
    projectBoardUseCase.getByPro.mockResolvedValue(sampleProjectBoard);
    projectBoardUseCase.update.mockResolvedValue(sampleProjectBoard);
    projectBoardUseCase.delete.mockResolvedValue(undefined);
  });

  describe('Authentication', () => {
    it('returns 401 when token is missing on protected route', async () => {
      const app = buildApp();

      const response = await request(app).get(`${apiBasePath}/users`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Token requerido' });
    });

    it('returns 401 when token is expired', async () => {
      const app = buildApp();
      const expiredToken = createExpiredToken();

      const response = await request(app)
        .get(`${apiBasePath}/users`)
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Token vencido' });
    });

    it('returns 401 when token is invalid', async () => {
      const app = buildApp();

      const response = await request(app)
        .get(`${apiBasePath}/users`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Token inválido' });
    });

    it('allows login without token', async () => {
      const app = buildApp();

      const response = await request(app)
        .post(`${apiBasePath}/users/login`)
        .send({ cc: sampleUser.cc, password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
    });
  });

  describe('User routes', () => {
    it('creates user successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const payload = {
        cc: '10002',
        email: 'new@kata.com',
        password: 'password123',
        userName: 'new-user',
        role: Role.DEV
      };

      const response = await request(app)
        .post(`${apiBasePath}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual({
        cc: payload.cc,
        email: payload.email,
        userName: payload.userName,
        role: payload.role
      });
    });

    it('fails validation when creating user with missing fields', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .post(`${apiBasePath}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({ cc: '10003' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'cc, email, password, userName y role son requeridos'
      });
    });

    it('returns 409 when user already exists', async () => {
      const app = buildApp();
      const token = createValidToken();

      userUseCase.create.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      const response = await request(app)
        .post(`${apiBasePath}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          cc: '10002',
          email: 'existing@kata.com',
          password: 'password123',
          userName: 'existing-user',
          role: Role.DEV
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'El usuario ya existe' });
    });

    it('lists users successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .get(`${apiBasePath}/users`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([sampleUser]);
    });

    it('returns 500 when service is down while listing users', async () => {
      const app = buildApp();
      const token = createValidToken();

      userUseCase.listAll.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .get(`${apiBasePath}/users`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('UserController.listAll: Service unavailable');
    });

    it('fails login validation when credentials are missing', async () => {
      const app = buildApp();

      const response = await request(app).post(`${apiBasePath}/users/login`).send({ cc: sampleUser.cc });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'cc y password son requeridos' });
    });

    it('returns 401 for invalid credentials on login', async () => {
      const app = buildApp();

      userUseCase.login.mockResolvedValue(null);

      const response = await request(app)
        .post(`${apiBasePath}/users/login`)
        .send({ cc: sampleUser.cc, password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Credenciales inválidas' });
    });

    it('updates user successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .put(`${apiBasePath}/users/${sampleUser.cc}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userName: 'updated-name' });

      expect(response.status).toBe(200);
      expect(response.body.data.cc).toBe(sampleUser.cc);
    });

    it('fails validation when update body is empty', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .put(`${apiBasePath}/users/${sampleUser.cc}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Debe enviar al menos un campo para actualizar' });
    });

    it('fails validation when role is not allowed', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .put(`${apiBasePath}/users/${sampleUser.cc}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'INVALID_ROLE' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Rol no permitido' });
    });

    it('returns 404 when user to update does not exist', async () => {
      const app = buildApp();
      const token = createValidToken();

      userUseCase.update.mockResolvedValue(null);

      const response = await request(app)
        .put(`${apiBasePath}/users/99999`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userName: 'updated-name' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuario no encontrado' });
    });

    it('deletes user successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .delete(`${apiBasePath}/users/${sampleUser.cc}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it('returns 404 when deleting non-existing user', async () => {
      const app = buildApp();
      const token = createValidToken();

      userUseCase.delete.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      const response = await request(app)
        .delete(`${apiBasePath}/users/99999`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuario no encontrado' });
    });
  });

  describe('Project board routes', () => {
    it('creates project board successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const payload = {
        pro: 'PRO-2',
        projectName: 'Proyecto Dos',
        hu: [{ hu: 'HU-2', descripcion: 'Nueva HU', status: 'TODO' }],
        accesos: ['DEV']
      };

      const response = await request(app)
        .post(`${apiBasePath}/project-boards`)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.pro).toBe(payload.pro);
    });

    it('fails validation when creating project board with missing fields', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .post(`${apiBasePath}/project-boards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ pro: 'PRO-3' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'pro, projectName, hu[] y accesos[] son requeridos' });
    });

    it('returns 409 when project board already exists', async () => {
      const app = buildApp();
      const token = createValidToken();

      projectBoardUseCase.create.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      const response = await request(app)
        .post(`${apiBasePath}/project-boards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pro: 'PRO-1',
          projectName: 'Proyecto Uno',
          hu: [{ hu: 'HU-1', descripcion: 'Nueva HU', status: 'TODO' }],
          accesos: ['DEV']
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'El project-board ya existe' });
    });

    it('lists project boards successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .get(`${apiBasePath}/project-boards`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([sampleProjectBoard]);
    });

    it('lists project boards by accessCode query successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .get(`${apiBasePath}/project-boards?accessCode=ADMIN`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(projectBoardUseCase.listByAccessCode).toHaveBeenCalledWith('ADMIN');
    });

    it('returns 500 when service is down while listing project boards', async () => {
      const app = buildApp();
      const token = createValidToken();

      projectBoardUseCase.listAll.mockRejectedValue(new Error('Project board service unavailable'));

      const response = await request(app)
        .get(`${apiBasePath}/project-boards`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain(
        'ProjectBoardController.listAll: Project board service unavailable'
      );
    });

    it('gets project board by accessCode path successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .get(`${apiBasePath}/project-boards/access/ADMIN`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([sampleProjectBoard]);
    });

    it('gets project board by pro successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .get(`${apiBasePath}/project-boards/${sampleProjectBoard.pro}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pro).toBe(sampleProjectBoard.pro);
    });

    it('returns 404 when project board by pro does not exist', async () => {
      const app = buildApp();
      const token = createValidToken();

      projectBoardUseCase.getByPro.mockResolvedValue(null);

      const response = await request(app)
        .get(`${apiBasePath}/project-boards/NOT_FOUND`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Project-board no encontrado' });
    });

    it('updates project board successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .put(`${apiBasePath}/project-boards/${sampleProjectBoard.pro}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ projectName: 'Proyecto actualizado' });

      expect(response.status).toBe(200);
      expect(response.body.data.pro).toBe(sampleProjectBoard.pro);
    });

    it('fails validation when project board update body is empty', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .put(`${apiBasePath}/project-boards/${sampleProjectBoard.pro}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Debe enviar al menos un campo para actualizar' });
    });

    it('returns 404 when updating non-existing project board', async () => {
      const app = buildApp();
      const token = createValidToken();

      projectBoardUseCase.update.mockResolvedValue(null);

      const response = await request(app)
        .put(`${apiBasePath}/project-boards/NOT_FOUND`)
        .set('Authorization', `Bearer ${token}`)
        .send({ projectName: 'Proyecto actualizado' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Project-board no encontrado' });
    });

    it('deletes project board successfully', async () => {
      const app = buildApp();
      const token = createValidToken();

      const response = await request(app)
        .delete(`${apiBasePath}/project-boards/${sampleProjectBoard.pro}`)
        .set('Authorization', `Bearer ${token}`);          

      expect(response.status).toBe(204);
    });

    it('returns 404 when deleting non-existing project board', async () => {
      const app = buildApp();
      const token = createValidToken();

      projectBoardUseCase.delete.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

      const response = await request(app)
        .delete(`${apiBasePath}/project-boards/NOT_FOUND`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Project-board no encontrado' });
    });
  });

  describe('App composition', () => {
    it('keeps auth middleware active even when controllers are not provided', async () => {
      const app = createApp();

      const response = await request(app).get(`${apiBasePath}/users`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Token requerido' });
    });

    it('returns generic 500 message when a non-Error is thrown', async () => {
      const token = createValidToken();

      const app = createApp({
        userController: {
          listAll: async () => {
            throw 'string-error';
          },
          login: async () => undefined,
          create: async () => undefined,
          update: async () => undefined,
          delete: async () => undefined
        } as unknown as UserController
      });

      const response = await request(app)
        .get(`${apiBasePath}/users`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
