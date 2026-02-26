import { ProjectBoardUseCase } from '@application/use-cases/projectBoardUseCase';
import { IProjectBoardRepository } from '@domain/repositories/projectBoardRepository';

describe('ProjectBoardUseCase', () => {
  let repository: jest.Mocked<IProjectBoardRepository>;
  let useCase: ProjectBoardUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      listAll: jest.fn(),
      listByAccessCode: jest.fn(),
      getByPro: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    useCase = new ProjectBoardUseCase(repository);
  });

  it('creates project board normalizing HU codes', async () => {
    await useCase.create({
      pro: 'PRO-1',
      projectName: 'Proyecto Uno',
      accesos: ['DEV'],
      hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }]
    });

    const savedModel = repository.create.mock.calls[0][0];
    expect(savedModel.pro).toBe('PRO-1');
    expect(savedModel.hu[0].codigo).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('wraps create errors with context', async () => {
    repository.create.mockRejectedValue(new Error('create failed'));

    await expect(
      useCase.create({
        pro: 'PRO-1',
        projectName: 'Proyecto Uno',
        accesos: ['DEV'],
        hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }]
      })
    ).rejects.toThrow('ProjectBoardUseCase.create: create failed');
  });

  it('delegates list and get operations to repository', async () => {
    repository.listAll.mockResolvedValue([]);
    repository.listByAccessCode.mockResolvedValue([]);
    repository.getByPro.mockResolvedValue(null);

    await useCase.listAll();
    await useCase.listByAccessCode('ADMIN');
    await useCase.getByPro('PRO-1');

    expect(repository.listAll).toHaveBeenCalledTimes(1);
    expect(repository.listByAccessCode).toHaveBeenCalledWith('ADMIN');
    expect(repository.getByPro).toHaveBeenCalledWith('PRO-1');
  });

  it('updates keeping existing codigo and creating missing codigo', async () => {
    repository.update.mockResolvedValue(null);

    await useCase.update('PRO-1', {
      hu: [
        { hu: 'HU-1', descripcion: 'Desc', status: 'TODO' },
        { hu: 'HU-2', descripcion: 'Done', status: 'DONE', codigo: 'fixed-code' }
      ]
    });

    const updateData = repository.update.mock.calls[0][1];
    expect(updateData.hu?.[0].codigo).toMatch(/^[0-9a-f-]{36}$/i);
    expect(updateData.hu?.[1].codigo).toBe('fixed-code');
  });

  it('updates without hu when payload has no hu', async () => {
    repository.update.mockResolvedValue(null);

    await useCase.update('PRO-1', { projectName: 'Proyecto nuevo' });

    expect(repository.update).toHaveBeenCalledWith('PRO-1', { projectName: 'Proyecto nuevo' });
  });

  it('wraps delete errors with context', async () => {
    repository.delete.mockRejectedValue(new Error('delete failed'));

    await expect(useCase.delete('PRO-1')).rejects.toThrow(
      'ProjectBoardUseCase.delete: delete failed'
    );
  });
});
