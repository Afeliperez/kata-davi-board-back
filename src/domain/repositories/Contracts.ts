import { Board } from '../entities/Board';
import {
  CreateProjectBoard,
  ProjectBoard,
  UpdateProjectBoard
} from '../entities/ProjectBoard';
import { CreateUser, User } from '../entities/User';

export interface IListBoardsUseCase {
  execute(): Promise<Board[]>;
}

export interface ICreateUserUseCase {
  execute(user: CreateUser): Promise<void>;
}

export interface IUpdateUserUseCase {
  execute(cc: string, data: Partial<CreateUser>): Promise<User | null>;
}

export interface IDeleteUserUseCase {
  execute(cc: string): Promise<void>;
}

export interface LoginResult {
  user: User;
  token: string;
}

export interface ILoginUseCase {
  execute(cc: string, password: string): Promise<LoginResult | null>;
}

export interface IUserUseCase {
  create(user: CreateUser): Promise<void>;
  listAll(): Promise<User[]>;
  login(cc: string, password: string): Promise<LoginResult | null>;
  update(cc: string, data: Partial<CreateUser>): Promise<User | null>;
  delete(cc: string): Promise<void>;
}

export interface IProjectBoardUseCase {
  create(projectBoard: CreateProjectBoard): Promise<void>;
  listAll(): Promise<ProjectBoard[]>;
  listByAccessCode(accessCode: string): Promise<ProjectBoard[]>;
  getByPro(pro: string): Promise<ProjectBoard | null>;
  update(pro: string, data: UpdateProjectBoard): Promise<ProjectBoard | null>;
  delete(pro: string): Promise<void>;
}