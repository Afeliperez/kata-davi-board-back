import type { ICreateProjectBoard, IProjectBoard, IUpdateProjectBoard } from '@domain/entities/ProjectBoard';

describe('ProjectBoard entity contracts', () => {
  it('allows typed create, update and model payloads', () => {
    const createPayload: ICreateProjectBoard = {
      pro: 'PRO-1',
      projectName: 'Proyecto Uno',
      hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO' }],
      accesos: ['DEV']
    };

    const model: IProjectBoard = {
      ...createPayload,
      hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO', codigo: 'C-1' }]
    };

    const updatePayload: IUpdateProjectBoard = {
      projectName: 'Proyecto Actualizado',
      accesos: ['QA']
    };

    expect(createPayload.pro).toBe('PRO-1');
    expect(model.hu[0].codigo).toBe('C-1');
    expect(updatePayload.projectName).toBe('Proyecto Actualizado');
  });
});
