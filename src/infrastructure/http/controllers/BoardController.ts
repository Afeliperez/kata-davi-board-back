import { Request, Response } from 'express';
import { IListBoardsUseCase } from '../../../domain/repositories/Contracts';

export class BoardController {
  constructor(private readonly listBoardsUseCase: IListBoardsUseCase) {}

  list = async (_request: Request, response: Response): Promise<void> => {
    const boards = await this.listBoardsUseCase.execute();

    response.status(200).json({
      data: boards
    });
  };
}