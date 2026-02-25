import { Board } from '../../../src/domain/entities/Board';
import { BoardRepository } from '../../../src/domain/repositories/BoardRepository';
import { ListBoardsUseCase } from '../../../src/application/use-cases/ListBoardsUseCase';

class BoardRepositoryStub implements BoardRepository {
  constructor(private readonly boards: Board[]) {}

  async findAll(): Promise<Board[]> {
    return this.boards;
  }
}

describe('ListBoardsUseCase', () => {
  it('returns all boards from repository', async () => {
    const boardRepository = new BoardRepositoryStub([
      { id: '1', name: 'Todo', createdAt: new Date('2026-01-10T00:00:00.000Z') }
    ]);

    const useCase = new ListBoardsUseCase(boardRepository);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: '1', name: 'Todo' });
  });
});