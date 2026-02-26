import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { DynamoDbProjectBoardRepository } from '@adapters/out/persistence/dynamodb/repositories/dynamoDbProjectBoardRepository';

describe('DynamoDbProjectBoardRepository', () => {
  const tableName = 'project-board-table';
  let send: jest.Mock;
  let repository: DynamoDbProjectBoardRepository;

  beforeEach(() => {
    send = jest.fn();
    repository = new DynamoDbProjectBoardRepository({ send } as never, tableName);
  });

  it('creates project board with conditional put', async () => {
    send.mockResolvedValue({});

    await repository.create({
      pro: 'PRO-1',
      projectName: 'Proyecto Uno',
      hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO', codigo: 'C-1' }],
      accesos: ['DEV']
    });

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(PutCommand);
    expect(command.input.ConditionExpression).toBe('attribute_not_exists(pro)');
  });

  it('lists all project boards mapping project-name field', async () => {
    send.mockResolvedValue({
      Items: [
        {
          pro: 'PRO-1',
          'project-name': 'Proyecto Uno',
          hu: [],
          accesos: ['DEV']
        }
      ]
    });

    const result = await repository.listAll();

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(ScanCommand);
    expect(result[0].projectName).toBe('Proyecto Uno');
  });

  it('returns empty list when listAll has no items', async () => {
    send.mockResolvedValue({ Items: [] });

    const result = await repository.listAll();

    expect(result).toEqual([]);
  });

  it('returns empty list when listAll items is undefined', async () => {
    send.mockResolvedValue({ Items: undefined });

    const result = await repository.listAll();

    expect(result).toEqual([]);
  });

  it('filters by access code through scan expression', async () => {
    send.mockResolvedValue({ Items: [] });

    await repository.listByAccessCode('DEV');

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(ScanCommand);
    expect(command.input.FilterExpression).toBe('contains(#accesos, :accessCode)');
    expect(command.input.ExpressionAttributeValues[':accessCode']).toBe('DEV');
  });

  it('maps listByAccessCode items when results exist', async () => {
    send.mockResolvedValue({
      Items: [
        {
          pro: 'PRO-1',
          'project-name': 'Proyecto Uno',
          hu: [],
          accesos: ['DEV']
        }
      ]
    });

    const result = await repository.listByAccessCode('DEV');

    expect(result).toEqual([{ pro: 'PRO-1', projectName: 'Proyecto Uno', hu: [], accesos: ['DEV'] }]);
  });

  it('returns null when project board is not found by pro', async () => {
    send.mockResolvedValue({ Item: undefined });

    const result = await repository.getByPro('PRO-1');

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(GetCommand);
    expect(result).toBeNull();
  });

  it('returns mapped project board when found by pro', async () => {
    send.mockResolvedValue({
      Item: {
        pro: 'PRO-1',
        'project-name': 'Proyecto Uno',
        hu: [],
        accesos: ['DEV']
      }
    });

    const result = await repository.getByPro('PRO-1');

    expect(result).toEqual({ pro: 'PRO-1', projectName: 'Proyecto Uno', hu: [], accesos: ['DEV'] });
  });

  it('returns null when update has no attributes', async () => {
    send.mockResolvedValue({ Attributes: undefined });

    const result = await repository.update('PRO-1', { projectName: 'x' });

    expect(result).toBeNull();
  });

  it('returns current record when update data is empty', async () => {
    const getByProSpy = jest.spyOn(repository, 'getByPro').mockResolvedValue({
      pro: 'PRO-1',
      projectName: 'Proyecto Uno',
      hu: [],
      accesos: ['DEV']
    });

    const result = await repository.update('PRO-1', {});

    expect(getByProSpy).toHaveBeenCalledWith('PRO-1');
    expect(result?.pro).toBe('PRO-1');
    expect(send).not.toHaveBeenCalled();
  });

  it('updates project board with dynamic expression', async () => {
    send.mockResolvedValue({
      Attributes: {
        pro: 'PRO-1',
        'project-name': 'Proyecto Actualizado',
        hu: [],
        accesos: ['DEV']
      }
    });

    const result = await repository.update('PRO-1', { projectName: 'Proyecto Actualizado' });

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(UpdateCommand);
    expect(command.input.UpdateExpression).toContain('#projectName = :projectName');
    expect(result?.projectName).toBe('Proyecto Actualizado');
  });

  it('updates project board including hu and accesos fields', async () => {
    send.mockResolvedValue({
      Attributes: {
        pro: 'PRO-1',
        'project-name': 'Proyecto Uno',
        hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO', codigo: 'C-1' }],
        accesos: ['QA']
      }
    });

    await repository.update('PRO-1', {
      hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO', codigo: 'C-1' }],
      accesos: ['QA']
    });

    const command = send.mock.calls[0][0];
    expect(command.input.UpdateExpression).toContain('#hu = :hu');
    expect(command.input.UpdateExpression).toContain('#accesos = :accesos');
  });

  it('deletes project board with conditional expression', async () => {
    send.mockResolvedValue({});

    await repository.delete('PRO-1');

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(DeleteCommand);
    expect(command.input.ConditionExpression).toBe('attribute_exists(pro)');
  });

  it('wraps repository errors with context', async () => {
    send.mockRejectedValue(new Error('dynamo down'));

    await expect(repository.listAll()).rejects.toThrow(
      'DynamoDbProjectBoardRepository.listAll: dynamo down'
    );
  });

  it('wraps create errors with context', async () => {
    send.mockRejectedValue(new Error('create failed'));

    await expect(
      repository.create({
        pro: 'PRO-1',
        projectName: 'Proyecto Uno',
        hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO', codigo: 'C-1' }],
        accesos: ['DEV']
      })
    ).rejects.toThrow('DynamoDbProjectBoardRepository.create: create failed');
  });

  it('wraps listByAccessCode errors with context', async () => {
    send.mockRejectedValue(new Error('list access failed'));

    await expect(repository.listByAccessCode('DEV')).rejects.toThrow(
      'DynamoDbProjectBoardRepository.listByAccessCode: list access failed'
    );
  });

  it('wraps getByPro errors with context', async () => {
    send.mockRejectedValue(new Error('get failed'));

    await expect(repository.getByPro('PRO-1')).rejects.toThrow(
      'DynamoDbProjectBoardRepository.getByPro: get failed'
    );
  });

  it('wraps update errors with context', async () => {
    send.mockRejectedValue(new Error('update failed'));

    await expect(repository.update('PRO-1', { projectName: 'x' })).rejects.toThrow(
      'DynamoDbProjectBoardRepository.update: update failed'
    );
  });

  it('wraps delete errors with context', async () => {
    send.mockRejectedValue(new Error('delete failed'));

    await expect(repository.delete('PRO-1')).rejects.toThrow(
      'DynamoDbProjectBoardRepository.delete: delete failed'
    );
  });
});
