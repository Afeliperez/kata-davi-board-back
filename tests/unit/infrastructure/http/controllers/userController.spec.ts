import { Request, Response } from 'express';
import { UserController } from '@/infrastructure/http/controllers/UserController';
import { IUserInputPort } from '@application/ports/in/userInputPort';
import { Role } from '@domain/entities/User';

const createResponseMock = (): Response => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.send = jest.fn().mockReturnValue(response);

  return response;
};

describe('Infrastructure UserController', () => {
  let userUseCase: jest.Mocked<IUserInputPort>;
  let controller: UserController;
  let response: Response;

  beforeEach(() => {
    userUseCase = {
      create: jest.fn(),
      listAll: jest.fn(),
      login: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    controller = new UserController(userUseCase);
    response = createResponseMock();
  });

  it('returns 400 when create payload is invalid', async () => {
    await controller.create({ body: { cc: '1' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 201 on create success', async () => {
    await controller.create(
      {
        body: {
          cc: '1',
          email: 'a@test.com',
          password: 'p',
          userName: 'u',
          role: Role.DEV
        }
      } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('returns 409 on duplicate create', async () => {
    userUseCase.create.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.create(
      {
        body: {
          cc: '1',
          email: 'a@test.com',
          password: 'p',
          userName: 'u',
          role: Role.DEV
        }
      } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(409);
  });

  it('throws on create unexpected errors', async () => {
    userUseCase.create.mockRejectedValue(new Error('create failed'));

    await expect(
      controller.create(
        {
          body: {
            cc: '1',
            email: 'a@test.com',
            password: 'p',
            userName: 'u',
            role: Role.DEV
          }
        } as Request,
        response
      )
    ).rejects.toThrow('create failed');
  });

  it('returns 200 on listAll success', async () => {
    userUseCase.listAll.mockResolvedValue([{ cc: '1', email: 'a', userName: 'u', role: Role.QA }]);

    await controller.listAll({} as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws on listAll unexpected errors', async () => {
    userUseCase.listAll.mockRejectedValue(new Error('list failed'));

    await expect(controller.listAll({} as Request, response)).rejects.toThrow('list failed');
  });

  it('returns 400 when login payload is invalid', async () => {
    await controller.login({ body: { cc: '1' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 when login credentials are invalid', async () => {
    userUseCase.login.mockResolvedValue(null);

    await controller.login({ body: { cc: '1', password: 'x' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 on login success', async () => {
    userUseCase.login.mockResolvedValue({
      user: { cc: '1', email: 'a', userName: 'u', role: Role.QA },
      token: 'token'
    });

    await controller.login({ body: { cc: '1', password: 'x' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws on login unexpected errors', async () => {
    userUseCase.login.mockRejectedValue(new Error('login failed'));

    await expect(controller.login({ body: { cc: '1', password: 'x' } } as Request, response)).rejects.toThrow(
      'login failed'
    );
  });

  it('returns 400 when update body is empty', async () => {
    await controller.update({ params: { cc: '1' }, body: {} } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when update role is invalid', async () => {
    await controller.update(
      { params: { cc: '1' }, body: { role: 'INVALID_ROLE' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 on update when user is missing', async () => {
    userUseCase.update.mockResolvedValue(null);

    await controller.update(
      { params: { cc: '1' }, body: { userName: 'new' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on update success', async () => {
    userUseCase.update.mockResolvedValue({ cc: '1', email: 'a', userName: 'u', role: Role.QA });

    await controller.update(
      { params: { cc: '1' }, body: { userName: 'new' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 on update conditional check errors', async () => {
    userUseCase.update.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.update(
      { params: { cc: '1' }, body: { userName: 'new' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws on update unexpected errors', async () => {
    userUseCase.update.mockRejectedValue(new Error('update failed'));

    await expect(
      controller.update(
        { params: { cc: '1' }, body: { userName: 'new' } } as unknown as Request,
        response
      )
    ).rejects.toThrow('update failed');
  });

  it('uses first cc value when cc param is array', async () => {
    userUseCase.update.mockResolvedValue({ cc: '1', email: 'a', userName: 'u', role: Role.QA });

    await controller.update(
      { params: { cc: ['1', '2'] }, body: { userName: 'new' } } as unknown as Request,
      response
    );

    expect(userUseCase.update).toHaveBeenCalledWith('1', expect.any(Object));
  });

  it('returns 204 on delete success', async () => {
    await controller.delete({ params: { cc: '1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('returns 404 on delete conditional check errors', async () => {
    userUseCase.delete.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.delete({ params: { cc: '1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws on delete unexpected errors', async () => {
    userUseCase.delete.mockRejectedValue(new Error('delete failed'));

    await expect(controller.delete({ params: { cc: '1' } } as unknown as Request, response)).rejects.toThrow(
      'delete failed'
    );
  });
});
