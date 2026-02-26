import { UserItemMapper } from '@adapters/out/persistence/dynamodb/mappers/userItemMapper';
import { Role } from '@domain/entities/User';

describe('UserItemMapper', () => {
  it('maps item to domain user', () => {
    const result = UserItemMapper.toDomain({
      cc: '1001',
      email: 'qa@test.com',
      userName: 'qa-user',
      role: Role.QA
    });

    expect(result).toEqual({
      cc: '1001',
      email: 'qa@test.com',
      userName: 'qa-user',
      role: Role.QA
    });
  });

  it('maps item to create user when password exists', () => {
    const result = UserItemMapper.toCreateUser({
      cc: '1001',
      email: 'qa@test.com',
      userName: 'qa-user',
      role: Role.QA,
      password: 'hashed'
    });

    expect(result?.password).toBe('hashed');
  });

  it('returns null when create user item has no password', () => {
    const result = UserItemMapper.toCreateUser({
      cc: '1001',
      email: 'qa@test.com',
      userName: 'qa-user',
      role: Role.QA
    });

    expect(result).toBeNull();
  });

  it('maps create user to persistence item', () => {
    const result = UserItemMapper.toItem({
      cc: '1001',
      email: 'qa@test.com',
      userName: 'qa-user',
      role: Role.QA,
      password: 'hashed'
    });

    expect(result.password).toBe('hashed');
  });
});
