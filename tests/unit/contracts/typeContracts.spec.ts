import type { ICreateUser, IUser } from '@domain/entities/User';
import type { ICreateProjectBoard, IProjectBoard, IUpdateProjectBoard } from '@domain/entities/ProjectBoard';
import type { IUserRepository } from '@domain/repositories/userRepository';
import type { IProjectBoardRepository } from '@domain/repositories/projectBoardRepository';
import type { ITokenService } from '@domain/services/tokenService';
import type { IUserInputPort } from '@application/ports/in/userInputPort';
import type { IProjectBoardInputPort } from '@application/ports/in/projectBoardInputPort';

describe('Type contracts', () => {
  it('supports IUserRepository contract', () => {
    const repository: IUserRepository = {
      create: async (user: ICreateUser): Promise<void> => {
        void user;
      },
      listAll: async (): Promise<IUser[]> => [],
      getByCcWithPassword: async (): Promise<ICreateUser | null> => null,
      getByCc: async (): Promise<IUser | null> => null,
      update: async (): Promise<IUser | null> => null,
      delete: async (): Promise<void> => undefined
    };

    expect(typeof repository.create).toBe('function');
  });

  it('supports IProjectBoardRepository contract', () => {
    const repository: IProjectBoardRepository = {
      create: async (projectBoard: IProjectBoard): Promise<void> => {
        void projectBoard;
      },
      listAll: async (): Promise<IProjectBoard[]> => [],
      listByAccessCode: async (): Promise<IProjectBoard[]> => [],
      getByPro: async (): Promise<IProjectBoard | null> => null,
      update: async (pro: string, data: IUpdateProjectBoard): Promise<IProjectBoard | null> => {
        void pro;
        void data;

        return null;
      },
      delete: async (): Promise<void> => undefined
    };

    expect(typeof repository.listByAccessCode).toBe('function');
  });

  it('supports ITokenService contract', async () => {
    const service: ITokenService = {
      sign: () => 'token',
      hashPassword: async () => 'hashed',
      verifyPassword: async () => true
    };

    await expect(service.hashPassword('pass')).resolves.toBe('hashed');
  });

  it('supports input ports contracts', () => {
    const userPort: IUserInputPort = {
      create: async (): Promise<void> => undefined,
      listAll: async (): Promise<IUser[]> => [],
      login: async () => null,
      update: async (): Promise<IUser | null> => null,
      delete: async (): Promise<void> => undefined
    };

    const projectPort: IProjectBoardInputPort = {
      create: async (projectBoard: ICreateProjectBoard): Promise<void> => {
        void projectBoard;
      },
      listAll: async (): Promise<IProjectBoard[]> => [],
      listByAccessCode: async (): Promise<IProjectBoard[]> => [],
      getByPro: async (): Promise<IProjectBoard | null> => null,
      update: async (): Promise<IProjectBoard | null> => null,
      delete: async (): Promise<void> => undefined
    };

    expect(typeof userPort.login).toBe('function');
    expect(typeof projectPort.getByPro).toBe('function');
  });
});
