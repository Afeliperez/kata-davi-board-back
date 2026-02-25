import { Board } from '../../../../domain/entities/Board';

export interface BoardItem {
  pk: string;
  sk: string;
  name: string;
  createdAt: string;
}

export class BoardItemMapper {
  static toDomain(item: BoardItem): Board {
    return {
      id: item.pk,
      name: item.name,
      createdAt: new Date(item.createdAt)
    };
  }

  static toItem(board: Board): BoardItem {
    return {
      pk: board.id,
      sk: 'BOARD',
      name: board.name,
      createdAt: board.createdAt.toISOString()
    };
  }
}