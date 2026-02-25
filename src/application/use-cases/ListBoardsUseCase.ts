import { Board } from '../../domain/entities/Board';
import { BoardRepository } from '../../domain/repositories/BoardRepository';
import { IListBoardsUseCase } from '../../domain/repositories/Contracts';

export class ListBoardsUseCase implements IListBoardsUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(): Promise<Board[]> {
    return this.boardRepository.findAll();
  }
}