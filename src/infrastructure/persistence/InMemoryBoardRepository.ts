import { Board } from '../../domain/entities/Board';
import { BoardRepository } from '../../domain/repositories/BoardRepository';

export class InMemoryBoardRepository implements BoardRepository {
  private readonly boards: Board[] = [
    {
      id: 'board-1',
      name: 'Backlog',
      createdAt: new Date('2026-01-01T00:00:00.000Z')
    },
    {
      id: 'board-2',
      name: 'In Progress',
      createdAt: new Date('2026-01-02T00:00:00.000Zs')
    }
  ];

  async findAll(): Promise<Board[]> {
    return this.boards;
  }
}