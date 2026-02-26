import {
  ICreateProjectBoard,
  IProjectBoard,
  IUpdateProjectBoard
} from '../entities/ProjectBoard';

export interface IProjectBoardRepository {
  create(projectBoard: IProjectBoard): Promise<void>;
  listAll(): Promise<IProjectBoard[]>;
  listByAccessCode(accessCode: string): Promise<IProjectBoard[]>;
  getByPro(pro: string): Promise<IProjectBoard | null>;
  update(pro: string, data: IUpdateProjectBoard): Promise<IProjectBoard | null>;
  delete(pro: string): Promise<void>;
}

export type { ICreateProjectBoard };