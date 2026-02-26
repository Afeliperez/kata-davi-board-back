const routerMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock('express', () => ({
  Router: jest.fn(() => routerMock)
}));

import { userRoutes } from '@adapters/in/http/routes/userRoutes';

describe('userRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers all user endpoints with controller handlers', () => {
    const controller = {
      listAll: jest.fn(),
      login: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    const router = userRoutes(controller as never);

    expect(router).toBe(routerMock);
    expect(routerMock.get).toHaveBeenCalledWith('/', controller.listAll);
    expect(routerMock.post).toHaveBeenCalledWith('/login', controller.login);
    expect(routerMock.post).toHaveBeenCalledWith('/', controller.create);
    expect(routerMock.put).toHaveBeenCalledWith('/:cc', controller.update);
    expect(routerMock.delete).toHaveBeenCalledWith('/:cc', controller.delete);
  });
});
