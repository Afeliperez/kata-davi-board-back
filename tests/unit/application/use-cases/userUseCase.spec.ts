import { UserUseCase } from '@application/use-cases/userUseCase';
import { Role } from '@domain/entities/User';
import { IUserRepository } from '@domain/repositories/userRepository';
import { ITokenService } from '@domain/services/tokenService';

describe('UserUseCase', () => {
  const user = {
    cc: '1001',
    email: 'qa@test.com',
    password: 'plain-pass',
    userName: 'qa-user',
    role: Role.QA
  };

  let repository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let useCase: UserUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      listAll: jest.fn(),
      getByCcWithPassword: jest.fn(),
      getByCc: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    tokenService = {
      sign: jest.fn(),
      hashPassword: jest.fn(),
      verifyPassword: jest.fn()
    };

    useCase = new UserUseCase(repository, tokenService);
  });

  it('creates user hashing password first', async () => {
    tokenService.hashPassword.mockResolvedValue('hashed-pass');

    await useCase.create(user);

    expect(tokenService.hashPassword).toHaveBeenCalledWith('plain-pass');
    expect(repository.create).toHaveBeenCalledWith({ ...user, password: 'hashed-pass' });
  });

  it('wraps create errors with context', async () => {
    tokenService.hashPassword.mockRejectedValue(new Error('hash failed'));

    await expect(useCase.create(user)).rejects.toThrow('UserUseCase.create: hash failed');
  });

  it('returns all users from repository', async () => {
    repository.listAll.mockResolvedValue([{ cc: '1001', email: 'a', userName: 'b', role: Role.DEV }]);

    const result = await useCase.listAll();

    expect(result).toHaveLength(1);
    expect(repository.listAll).toHaveBeenCalledTimes(1);
  });

  it('returns null when login user does not exist', async () => {
    repository.getByCcWithPassword.mockResolvedValue(null);

    const result = await useCase.login('1001', 'secret');

    expect(result).toBeNull();
  });

  it('returns null when password is invalid', async () => {
    repository.getByCcWithPassword.mockResolvedValue(user);
    tokenService.verifyPassword.mockResolvedValue(false);

    const result = await useCase.login('1001', 'secret');

    expect(result).toBeNull();
  });

  it('returns user and token when login is valid', async () => {
    repository.getByCcWithPassword.mockResolvedValue(user);
    tokenService.verifyPassword.mockResolvedValue(true);
    tokenService.sign.mockReturnValue('jwt-token');

    const result = await useCase.login('1001', 'secret');

    expect(tokenService.sign).toHaveBeenCalledWith({ cc: '1001', role: Role.QA });
    expect(result).toEqual({
      user: {
        cc: '1001',
        email: 'qa@test.com',
        userName: 'qa-user',
        role: Role.QA
      },
      token: 'jwt-token'
    });
  });

  it('updates user without hashing when password is not present', async () => {
    repository.update.mockResolvedValue({ cc: '1001', email: 'new', userName: 'qa-user', role: Role.QA });

    await useCase.update('1001', { email: 'new' });

    expect(tokenService.hashPassword).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith('1001', { email: 'new' });
  });

  it('hashes password on update when password is present', async () => {
    tokenService.hashPassword.mockResolvedValue('hashed-pass');
    repository.update.mockResolvedValue({ cc: '1001', email: 'new', userName: 'qa-user', role: Role.QA });

    await useCase.update('1001', { password: 'new-pass' });

    expect(repository.update).toHaveBeenCalledWith('1001', { password: 'hashed-pass' });
  });

  it('wraps delete errors with context', async () => {
    repository.delete.mockRejectedValue(new Error('delete failed'));

    await expect(useCase.delete('1001')).rejects.toThrow('UserUseCase.delete: delete failed');
  });
});
