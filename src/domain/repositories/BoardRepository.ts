import { Board } from '../entities/Board';

export interface BoardRepository {
  findAll(): Promise<Board[]>; 
}