import {
  CreateProjectBoard,
  ProjectBoard,
  UpdateProjectBoard
} from '../entities/ProjectBoard';

export interface ProjectBoardRepository {
  create(projectBoard: ProjectBoard): Promise<void>;
  listAll(): Promise<ProjectBoard[]>;
  listByAccessCode(accessCode: string): Promise<ProjectBoard[]>;
  getByPro(pro: string): Promise<ProjectBoard | null>;
  update(pro: string, data: UpdateProjectBoard): Promise<ProjectBoard | null>;
  delete(pro: string): Promise<void>;
}

export type { CreateProjectBoard };