import { Request, Response } from 'express';
import { ProjectBoardController } from '@/infrastructure/http/controllers/ProjectBoardController';
import { IProjectBoardInputPort } from '@application/ports/in/projectBoardInputPort';

const createResponseMock = (): Response => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  response.send = jest.fn().mockReturnValue(response);

  return response;
};

describe('Infrastructure ProjectBoardController', () => {
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
    await controller.create({ body: { pro: 'P1' } } as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 201 on create success', async () => {
    await controller.create(
      {
        body: {
          pro: 'P1',
          projectName: 'Proyecto Uno',
          hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }],
          accesos: ['DEV']
        }
      } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('returns 409 on duplicate create', async () => {
    projectBoardUseCase.create.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.create(
      {
        body: {
          pro: 'P1',
          projectName: 'Proyecto Uno',
          hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }],
          accesos: ['DEV']
        }
      } as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(409);
  });

  it('throws on create unexpected errors', async () => {
    projectBoardUseCase.create.mockRejectedValue(new Error('create failed'));

    await expect(
      controller.create(
        {
          body: {
            pro: 'P1',
            projectName: 'Proyecto Uno',
            hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }],
            accesos: ['DEV']
          }
        } as Request,
        response
      )
    ).rejects.toThrow('create failed');
  });

  it('returns 200 on listAll success without access code', async () => {
    projectBoardUseCase.listAll.mockResolvedValue([]);

    await controller.listAll({ query: {} } as unknown as Request, response);

    expect(projectBoardUseCase.listAll).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 on listAll success with access code query', async () => {
    projectBoardUseCase.listByAccessCode.mockResolvedValue([]);

    await controller.listAll({ query: { accessCode: 'DEV' } } as unknown as Request, response);

    expect(projectBoardUseCase.listByAccessCode).toHaveBeenCalledWith('DEV');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws on listAll unexpected errors', async () => {
    projectBoardUseCase.listAll.mockRejectedValue(new Error('list failed'));

    await expect(controller.listAll({ query: {} } as unknown as Request, response)).rejects.toThrow(
      'list failed'
    );
  });

  it('returns 200 on listByAccessCode success', async () => {
    projectBoardUseCase.listByAccessCode.mockResolvedValue([]);

    await controller.listByAccessCode(
      { params: { accessCode: 'DEV' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws on listByAccessCode unexpected errors', async () => {
    projectBoardUseCase.listByAccessCode.mockRejectedValue(new Error('access list failed'));

    await expect(
      controller.listByAccessCode({ params: { accessCode: 'DEV' } } as unknown as Request, response)
    ).rejects.toThrow('access list failed');
  });

  it('returns 404 on getByPro when project board does not exist', async () => {
    projectBoardUseCase.getByPro.mockResolvedValue(null);

    await controller.getByPro({ params: { pro: 'P1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on getByPro success', async () => {
    projectBoardUseCase.getByPro.mockResolvedValue({
      pro: 'P1',
      projectName: 'Proyecto Uno',
      hu: [],
      accesos: ['DEV']
    });

    await controller.getByPro({ params: { pro: 'P1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('throws on getByPro unexpected errors', async () => {
    projectBoardUseCase.getByPro.mockRejectedValue(new Error('get failed'));

    await expect(controller.getByPro({ params: { pro: 'P1' } } as unknown as Request, response)).rejects.toThrow(
      'get failed'
    );
  });

  it('returns 400 on update empty payload', async () => {
    await controller.update({ params: { pro: 'P1' }, body: {} } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 on update success', async () => {
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

  it('returns 404 on update conditional check errors', async () => {
    projectBoardUseCase.update.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.update(
      { params: { pro: 'P1' }, body: { projectName: 'Proyecto Nuevo' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws on update unexpected errors', async () => {
    projectBoardUseCase.update.mockRejectedValue(new Error('update failed'));

    await expect(
      controller.update(
        { params: { pro: 'P1' }, body: { projectName: 'Proyecto Nuevo' } } as unknown as Request,
        response
      )
    ).rejects.toThrow('update failed');
  });

  it('returns 204 on delete success', async () => {
    await controller.delete({ params: { pro: 'P1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('returns 404 on delete conditional check errors', async () => {
    projectBoardUseCase.delete.mockRejectedValue({ name: 'ConditionalCheckFailedException' });

    await controller.delete({ params: { pro: 'P1' } } as unknown as Request, response);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('throws on delete unexpected errors', async () => {
    projectBoardUseCase.delete.mockRejectedValue(new Error('delete failed'));

    await expect(controller.delete({ params: { pro: 'P1' } } as unknown as Request, response)).rejects.toThrow(
      'delete failed'
    );
  });

  it('returns 400 on listByAccessCode when param is missing', async () => {
    await controller.listByAccessCode(
      { params: { accessCode: '' } } as unknown as Request,
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('uses first accessCode when param is array', async () => {
    projectBoardUseCase.listByAccessCode.mockResolvedValue([]);

    await controller.listByAccessCode(
      { params: { accessCode: ['DEV', 'QA'] } } as unknown as Request,
      response
    );

    expect(projectBoardUseCase.listByAccessCode).toHaveBeenCalledWith('DEV');
  });

  it('falls back to listAll when accessCode query array has non-string first value', async () => {
    projectBoardUseCase.listAll.mockResolvedValue([]);

    await controller.listAll(
      { query: { accessCode: [123, 'DEV'] } } as unknown as Request,
      response
    );

    expect(projectBoardUseCase.listAll).toHaveBeenCalledTimes(1);
  });

  it('uses first pro when getByPro param is array', async () => {
    projectBoardUseCase.getByPro.mockResolvedValue({
      pro: 'P1',
      projectName: 'Proyecto Uno',
      hu: [],
      accesos: ['DEV']
    });

    await controller.getByPro({ params: { pro: ['P1', 'P2'] } } as unknown as Request, response);

    expect(projectBoardUseCase.getByPro).toHaveBeenCalledWith('P1');
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

  it('uses first pro when delete param is array', async () => {
    await controller.delete({ params: { pro: ['P1', 'P2'] } } as unknown as Request, response);

    expect(projectBoardUseCase.delete).toHaveBeenCalledWith('P1');
  });
});
