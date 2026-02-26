import { Request, Response } from 'express';
import { ProjectBoardController } from '@adapters/in/http/controllers/projectBoardController';
import { IProjectBoardInputPort } from '@application/ports/in/projectBoardInputPort';

const createResponseMock = (): Response => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.send = jest.fn().mockReturnValue(response);

  return response;
};

describe('ProjectBoardController', () => {
  let projectBoardUseCase: jest.Mocked<IProjectBoardInputPort>;
  let controller: ProjectBoardController;
  let response: Response;

  beforeEach(() => {
    projectBoardUseCase = {
      create: jest.fn(),
      listAll: jest.fn(),
      listByAccessCode: jest.fn(),
      getByPro: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    controller = new ProjectBoardController(projectBoardUseCase);
    response = createResponseMock();
  });

  it('returns 400 when create payload is invalid', async () => {
    await controller.create({ body: { pro: 'PRO-1' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 409 when create detects duplicated board', async () => {
    projectBoardUseCase.create.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.create(
      {
        body: {
          pro: 'PRO-1',
          projectName: 'Proyecto Uno',
          hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }],
          accesos: ['DEV']
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
          pro: 'PRO-1',
          projectName: 'Proyecto Uno',
          hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }],
          accesos: ['DEV']
        }
      } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('throws contextual error when create fails unexpectedly', async () => {
    projectBoardUseCase.create.mockRejectedValue(new Error('create failed'));

    await expect(
      controller.create(
        {
          body: {
            pro: 'PRO-1',
            projectName: 'Proyecto Uno',
            hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }],
            accesos: ['DEV']
          }
        } as Request,
        response
      )
    ).rejects.toThrow('ProjectBoardController.create: create failed');
  });

  it('returns 200 when listAll succeeds', async () => {
    projectBoardUseCase.listAll.mockResolvedValue([]);

    await controller.listAll({ query: {} } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 when listAll uses accessCode query', async () => {
    projectBoardUseCase.listByAccessCode.mockResolvedValue([]);

    await controller.listAll({ query: { accessCode: 'DEV' } } as unknown as Request, response);

    expect(projectBoardUseCase.listByAccessCode).toHaveBeenCalledWith('DEV');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('falls back to listAll when accessCode query array starts with non-string', async () => {
    projectBoardUseCase.listAll.mockResolvedValue([]);

    await controller.listAll(
      { query: { accessCode: [123, 'DEV'] } } as unknown as Request,
      response
    );

    expect(projectBoardUseCase.listAll).toHaveBeenCalledTimes(1);
  });

  it('returns 200 when listAll uses accessCode query', async () => {
    projectBoardUseCase.listByAccessCode.mockResolvedValue([]);

    await controller.listAll({ query: { accessCode: 'DEV' } } as unknown as Request, response);

    expect(projectBoardUseCase.listByAccessCode).toHaveBeenCalledWith('DEV');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws contextual error when listAll fails unexpectedly', async () => {
    projectBoardUseCase.listAll.mockRejectedValue(new Error('list failed'));

    await expect(controller.listAll({ query: {} } as unknown as Request, response)).rejects.toThrow(
      'ProjectBoardController.listAll: list failed'
    );
  });

  it('returns 200 when listByAccessCode succeeds', async () => {
    projectBoardUseCase.listByAccessCode.mockResolvedValue([]);

    await controller.listByAccessCode(
      { params: { accessCode: 'DEV' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 when accessCode param is missing', async () => {
    await controller.listByAccessCode(
      { params: { accessCode: '' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('throws contextual error when listByAccessCode fails', async () => {
    projectBoardUseCase.listByAccessCode.mockRejectedValue(new Error('db down'));

    await expect(
      controller.listByAccessCode({ params: { accessCode: 'DEV' } } as unknown as Request, response)
    ).rejects.toThrow('ProjectBoardController.listByAccessCode: db down');
  });

  it('returns 400 when listByAccessCode param is missing', async () => {
    await controller.listByAccessCode(
      { params: { accessCode: '' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('uses first accessCode when listByAccessCode param is array', async () => {
    projectBoardUseCase.listByAccessCode.mockResolvedValue([]);

    await controller.listByAccessCode(
      { params: { accessCode: ['DEV', 'QA'] } } as unknown as Request,
      response
    );

    expect(projectBoardUseCase.listByAccessCode).toHaveBeenCalledWith('DEV');
  });

  it('returns 404 when getByPro does not find record', async () => {
    projectBoardUseCase.getByPro.mockResolvedValue(null);

    await controller.getByPro({ params: { pro: 'NOT_FOUND' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('uses first pro when getByPro param is array', async () => {
    projectBoardUseCase.getByPro.mockResolvedValue({
      pro: 'P1',
      projectName: 'Proyecto',
      hu: [],
      accesos: ['DEV']
    });

    await controller.getByPro({ params: { pro: ['P1', 'P2'] } } as unknown as Request, response);

    expect(projectBoardUseCase.getByPro).toHaveBeenCalledWith('P1');
  });

  it('returns 200 when getByPro succeeds', async () => {
    projectBoardUseCase.getByPro.mockResolvedValue({
      pro: 'P1',
      projectName: 'Proyecto',
      hu: [],
      accesos: ['DEV']
    });

    await controller.getByPro({ params: { pro: 'P1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws contextual error when getByPro fails unexpectedly', async () => {
    projectBoardUseCase.getByPro.mockRejectedValue(new Error('get failed'));

    await expect(controller.getByPro({ params: { pro: 'P1' } } as unknown as Request, response)).rejects.toThrow(
      'ProjectBoardController.getByPro: get failed'
    );
  });

  it('returns 400 when update body is empty', async () => {
    await controller.update({ params: { pro: 'P1' }, body: {} } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 when update succeeds', async () => {
    projectBoardUseCase.update.mockResolvedValue({
      pro: 'P1',
      projectName: 'Proyecto Nuevo',
      hu: [],
      accesos: ['DEV']
    });

    await controller.update(
      { params: { pro: 'P1' }, body: { projectName: 'Proyecto Nuevo' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('uses first pro when update param is array', async () => {
    projectBoardUseCase.update.mockResolvedValue({
      pro: 'P1',
      projectName: 'Proyecto Nuevo',
      hu: [],
      accesos: ['DEV']
    });

    await controller.update(
      { params: { pro: ['P1', 'P2'] }, body: { projectName: 'Proyecto Nuevo' } } as unknown as Request,
      response
    );

    expect(projectBoardUseCase.update).toHaveBeenCalledWith('P1', expect.any(Object));
  });

  it('returns 404 when update gets conditional check error', async () => {
    projectBoardUseCase.update.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.update(
      { params: { pro: 'P1' }, body: { projectName: 'Proyecto Nuevo' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws contextual error when update fails unexpectedly', async () => {
    projectBoardUseCase.update.mockRejectedValue(new Error('update failed'));

    await expect(
      controller.update(
        { params: { pro: 'P1' }, body: { projectName: 'Proyecto Nuevo' } } as unknown as Request,
        response
      )
    ).rejects.toThrow('ProjectBoardController.update: update failed');
  });

  it('uses first pro value when pro param is array', async () => {
    projectBoardUseCase.update.mockResolvedValue({
      pro: 'P1',
      projectName: 'Proyecto Nuevo',
      hu: [],
      accesos: ['DEV']
    });

    await controller.update(
      { params: { pro: ['P1', 'P2'] }, body: { projectName: 'Proyecto Nuevo' } } as unknown as Request,
      response
    );

    expect(projectBoardUseCase.update).toHaveBeenCalledWith('P1', expect.any(Object));
  });

  it('returns 204 when delete succeeds', async () => {
    await controller.delete({ params: { pro: 'P1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('returns 404 when delete gets conditional check error', async () => {
    projectBoardUseCase.delete.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.delete({ params: { pro: 'P1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws contextual error when delete fails unexpectedly', async () => {
    projectBoardUseCase.delete.mockRejectedValue(new Error('delete failed'));

    await expect(controller.delete({ params: { pro: 'P1' } } as unknown as Request, response)).rejects.toThrow(
      'ProjectBoardController.delete: delete failed'
    );
  });

  it('uses first pro when delete param is array', async () => {
    await controller.delete({ params: { pro: ['P1', 'P2'] } } as unknown as Request, response);

    expect(projectBoardUseCase.delete).toHaveBeenCalledWith('P1');
  });
});
