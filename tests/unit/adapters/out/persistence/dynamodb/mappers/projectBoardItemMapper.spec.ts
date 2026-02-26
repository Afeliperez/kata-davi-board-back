import { ProjectBoardItemMapper } from '@adapters/out/persistence/dynamodb/mappers/projectBoardItemMapper';

describe('ProjectBoardItemMapper', () => {
  const model = {
    pro: 'PRO-1',
    projectName: 'Proyecto Uno',
    hu: [{ hu: 'HU-1', descripcion: 'Desc', status: 'TODO', codigo: 'C-1' }],
    accesos: ['DEV']
  };

  it('maps persistence item to domain model', () => {
    const result = ProjectBoardItemMapper.toDomain({
      pro: 'PRO-1',
      'project-name': 'Proyecto Uno',
      hu: model.hu,
      accesos: ['DEV']
    });

    expect(result).toEqual(model);
  });

  it('maps domain model to persistence item', () => {
    const result = ProjectBoardItemMapper.toItem(model);

    expect(result).toEqual({
      pro: 'PRO-1',
      'project-name': 'Proyecto Uno',
      hu: model.hu,
      accesos: ['DEV']
    });
  });
});
