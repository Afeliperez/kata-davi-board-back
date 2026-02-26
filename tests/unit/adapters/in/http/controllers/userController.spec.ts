import { Request, Response } from 'express';
import { UserController } from '@adapters/in/http/controllers/userController';
import { IUserInputPort } from '@application/ports/in/userInputPort';
import { Role } from '@domain/entities/User';

const createResponseMock = (): Response => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.send = jest.fn().mockReturnValue(response);

  return response;
};

describe('UserController', () => {
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

  it('returns 400 when create payload is missing email', async () => {
    await controller.create(
      { body: { cc: '1', password: 'p', userName: 'u', role: Role.DEV } } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when create payload is missing password', async () => {
    await controller.create(
      { body: { cc: '1', email: 'a@test.com', userName: 'u', role: Role.DEV } } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when create payload is missing userName', async () => {
    await controller.create(
      { body: { cc: '1', email: 'a@test.com', password: 'p', role: Role.DEV } } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when create payload is missing role', async () => {
    await controller.create(
      { body: { cc: '1', email: 'a@test.com', password: 'p', userName: 'u' } } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 409 when create detects duplicated user', async () => {
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

  it('returns 201 when create succeeds', async () => {
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

  it('throws contextual error when create fails unexpectedly', async () => {
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
    ).rejects.toThrow('UserController.create: create failed');
  });

  it('returns 200 on listAll success', async () => {
    userUseCase.listAll.mockResolvedValue([{ cc: '1', email: 'a', userName: 'u', role: Role.QA }]);

    await controller.listAll({} as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws contextual error when listAll fails', async () => {
    userUseCase.listAll.mockRejectedValue(new Error('db down'));

    await expect(controller.listAll({} as Request, response)).rejects.toThrow(
      'UserController.listAll: db down'
    );
  });

  it('returns 401 when login credentials are invalid', async () => {
    userUseCase.login.mockResolvedValue(null);

    await controller.login({ body: { cc: '1', password: 'x' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when login payload is invalid', async () => {
    await controller.login({ body: { cc: '1' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when login payload is missing cc', async () => {
    await controller.login({ body: { password: 'x' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 when login succeeds', async () => {
    userUseCase.login.mockResolvedValue({
      user: { cc: '1', email: 'a', userName: 'u', role: Role.QA },
      token: 'token'
    });

    await controller.login({ body: { cc: '1', password: 'x' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws contextual error when login fails unexpectedly', async () => {
    userUseCase.login.mockRejectedValue(new Error('login failed'));

    await expect(controller.login({ body: { cc: '1', password: 'x' } } as Request, response)).rejects.toThrow(
      'UserController.login: login failed'
    );
  });

  it('returns 400 for invalid role on update', async () => {
    await controller.update(
      { params: { cc: '1' }, body: { role: 'INVALID_ROLE' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when update payload is empty', async () => {
    await controller.update({ params: { cc: '1' }, body: {} } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 when update succeeds', async () => {
    userUseCase.update.mockResolvedValue({ cc: '1', email: 'a', userName: 'u', role: Role.QA });

    await controller.update(
      { params: { cc: '1' }, body: { userName: 'new' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 when update gets conditional check error', async () => {
    userUseCase.update.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.update(
      { params: { cc: '1' }, body: { userName: 'new' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws contextual error when update fails unexpectedly', async () => {
    userUseCase.update.mockRejectedValue(new Error('update failed'));

    await expect(
      controller.update(
        { params: { cc: '1' }, body: { userName: 'new' } } as unknown as Request,
        response
      )
    ).rejects.toThrow('UserController.update: update failed');
  });

  it('uses first cc value when param cc is array', async () => {
    userUseCase.update.mockResolvedValue({ cc: '1', email: 'a', userName: 'u', role: Role.QA });

    await controller.update(
      { params: { cc: ['1', '2'] }, body: { userName: 'new' } } as unknown as Request,
      response
    );

    expect(userUseCase.update).toHaveBeenCalledWith('1', expect.any(Object));
  });

  it('returns 204 when delete succeeds', async () => {
    await controller.delete({ params: { cc: '1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('returns 404 when delete gets conditional check error', async () => {
    userUseCase.delete.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.delete({ params: { cc: '1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws contextual error when delete fails unexpectedly', async () => {
    userUseCase.delete.mockRejectedValue(new Error('delete failed'));

    await expect(controller.delete({ params: { cc: '1' } } as unknown as Request, response)).rejects.toThrow(
      'UserController.delete: delete failed'
    );
  });
});
