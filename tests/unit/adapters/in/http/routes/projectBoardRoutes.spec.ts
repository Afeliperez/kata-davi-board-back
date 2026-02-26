const routerMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock('express', () => ({
  Router: jest.fn(() => routerMock)
}));

import { projectBoardRoutes } from '@adapters/in/http/routes/projectBoardRoutes';

describe('projectBoardRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers all project board endpoints with controller handlers', () => {
    const controller = {
      create: jest.fn(),
      listAll: jest.fn(),
      listByAccessCode: jest.fn(),
      getByPro: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    const router = projectBoardRoutes(controller as never);

    expect(router).toBe(routerMock);
    expect(routerMock.post).toHaveBeenCalledWith('/', controller.create);
    expect(routerMock.get).toHaveBeenCalledWith('/', controller.listAll);
    expect(routerMock.get).toHaveBeenCalledWith('/access/:accessCode', controller.listByAccessCode);
    expect(routerMock.get).toHaveBeenCalledWith('/:pro', controller.getByPro);
    expect(routerMock.put).toHaveBeenCalledWith('/:pro', controller.update);
    expect(routerMock.delete).toHaveBeenCalledWith('/:pro', controller.delete);
  });
});
