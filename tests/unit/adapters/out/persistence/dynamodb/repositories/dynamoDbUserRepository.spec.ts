import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { DynamoDbUserRepository } from '@adapters/out/persistence/dynamodb/repositories/dynamoDbUserRepository';
import { Role } from '@domain/entities/User';

describe('DynamoDbUserRepository', () => {
  const tableName = 'users-table';
  let send: jest.Mock;
  let repository: DynamoDbUserRepository;

  beforeEach(() => {
    send = jest.fn();
    repository = new DynamoDbUserRepository({ send } as never, tableName);
  });

  it('creates user with conditional put command', async () => {
    send.mockResolvedValue({});

    await repository.create({
      cc: '1001',
      email: 'qa@test.com',
      password: 'hashed',
      userName: 'qa-user',
      role: Role.QA
    });

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(PutCommand);
    expect(command.input.TableName).toBe(tableName);
    expect(command.input.ConditionExpression).toBe('attribute_not_exists(cc)');
  });

  it('lists users excluding ADMIN role', async () => {
    send.mockResolvedValue({
      Items: [
        { cc: '1', email: 'a', userName: 'u1', role: Role.ADMIN },
        { cc: '2', email: 'b', userName: 'u2', role: Role.DEV }
      ]
    });

    const users = await repository.listAll();

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(ScanCommand);
    expect(users).toEqual([{ cc: '2', email: 'b', userName: 'u2', role: Role.DEV }]);
  });

  it('returns empty list when scan has no items', async () => {
    send.mockResolvedValue({ Items: [] });

    const users = await repository.listAll();

    expect(users).toEqual([]);
  });

  it('returns empty list when scan items is undefined', async () => {
    send.mockResolvedValue({ Items: undefined });

    const users = await repository.listAll();

    expect(users).toEqual([]);
  });

  it('returns null when user by cc with password does not exist', async () => {
    send.mockResolvedValue({ Item: undefined });

    const result = await repository.getByCcWithPassword('1001');

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetCommand);
    expect(result).toBeNull();
  });

  it('returns null when user by cc with password has no password field', async () => {
    send.mockResolvedValue({
      Item: { cc: '1', email: 'a', userName: 'u', role: Role.DEV }
    });

    const result = await repository.getByCcWithPassword('1');

    expect(result).toBeNull();
  });

  it('returns user by cc when item exists', async () => {
    send.mockResolvedValue({
      Item: { cc: '1', email: 'a', userName: 'u', role: Role.DEV }
    });

    const result = await repository.getByCc('1');

    expect(result).toEqual({ cc: '1', email: 'a', userName: 'u', role: Role.DEV });
  });

  it('returns null when user by cc does not exist', async () => {
    send.mockResolvedValue({ Item: undefined });

    const result = await repository.getByCc('1');

    expect(result).toBeNull();
  });

  it('returns null when update has no attributes', async () => {
    send.mockResolvedValue({ Attributes: undefined });

    const result = await repository.update('1', { email: 'a@test.com' });

    expect(result).toBeNull();
  });

  it('returns current user when update data is empty', async () => {
    const getByCcSpy = jest
      .spyOn(repository, 'getByCc')
      .mockResolvedValue({ cc: '1', email: 'a', userName: 'u', role: Role.DEV });

    const result = await repository.update('1', {});

    expect(getByCcSpy).toHaveBeenCalledWith('1');
    expect(result?.cc).toBe('1');
    expect(send).not.toHaveBeenCalled();
  });

  it('updates user with dynamic update expression', async () => {
    send.mockResolvedValue({
      Attributes: {
        cc: '1',
        email: 'new@test.com',
        userName: 'qa-user',
        role: Role.QA
      }
    });

    const result = await repository.update('1', { email: 'new@test.com', role: Role.QA });

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(UpdateCommand);
    expect(command.input.UpdateExpression).toContain('#email = :email');
    expect(command.input.UpdateExpression).toContain('#role = :role');
    expect(result?.email).toBe('new@test.com');
  });

  it('updates user including password and userName fields', async () => {
    send.mockResolvedValue({
      Attributes: {
        cc: '1',
        email: 'a@test.com',
        userName: 'new-name',
        role: Role.QA
      }
    });

    await repository.update('1', { password: 'hashed-pass', userName: 'new-name' });

    const command = send.mock.calls[0][0];
    expect(command.input.UpdateExpression).toContain('#password = :password');
    expect(command.input.UpdateExpression).toContain('#userName = :userName');
    expect(command.input.ExpressionAttributeValues[':password']).toBe('hashed-pass');
    expect(command.input.ExpressionAttributeValues[':userName']).toBe('new-name');
  });

  it('deletes user with conditional expression', async () => {
    send.mockResolvedValue({});

    await repository.delete('1');

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(DeleteCommand);
    expect(command.input.ConditionExpression).toBe('attribute_exists(cc)');
  });

  it('wraps repository errors with context', async () => {
    send.mockRejectedValue(new Error('dynamo down'));

    await expect(repository.listAll()).rejects.toThrow('DynamoDbUserRepository.listAll: dynamo down');
  });

  it('wraps create errors with context', async () => {
    send.mockRejectedValue(new Error('create failed'));

    await expect(
      repository.create({
        cc: '1001',
        email: 'qa@test.com',
        password: 'hashed',
        userName: 'qa-user',
        role: Role.QA
      })
    ).rejects.toThrow('DynamoDbUserRepository.create: create failed');
  });

  it('wraps getByCcWithPassword errors with context', async () => {
    send.mockRejectedValue(new Error('get password failed'));

    await expect(repository.getByCcWithPassword('1')).rejects.toThrow(
      'DynamoDbUserRepository.getByCcWithPassword: get password failed'
    );
  });

  it('wraps getByCc errors with context', async () => {
    send.mockRejectedValue(new Error('get failed'));

    await expect(repository.getByCc('1')).rejects.toThrow('DynamoDbUserRepository.getByCc: get failed');
  });

  it('wraps update errors with context', async () => {
    send.mockRejectedValue(new Error('update failed'));

    await expect(repository.update('1', { email: 'a@test.com' })).rejects.toThrow(
      'DynamoDbUserRepository.update: update failed'
    );
  });

  it('wraps delete errors with context', async () => {
    send.mockRejectedValue(new Error('delete failed'));

    await expect(repository.delete('1')).rejects.toThrow('DynamoDbUserRepository.delete: delete failed');
  });
});
