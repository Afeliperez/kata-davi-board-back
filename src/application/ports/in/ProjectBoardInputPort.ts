import {
  ICreateProjectBoard,
  IProjectBoard,
  IUpdateProjectBoard
} from '../../../domain/entities/ProjectBoard';

export interface IProjectBoardInputPort {
  create(projectBoard: ICreateProjectBoard): Promise<void>;
  listAll(): Promise<IProjectBoard[]>;
  listByAccessCode(accessCode: string): Promise<IProjectBoard[]>;
  getByPro(pro: string): Promise<IProjectBoard | null>;
  update(pro: string, data: IUpdateProjectBoard): Promise<IProjectBoard | null>;
  delete(pro: string): Promise<void>;
}