import { ICreateUser, IUser } from '../entities/User';

export interface IUserRepository {
  create(user: ICreateUser): Promise<void>;
  listAll(): Promise<IUser[]>;
  getByCcWithPassword(cc: string): Promise<ICreateUser | null>;
  getByCc(cc: string): Promise<IUser | null>;
  update(cc: string, data: Partial<ICreateUser>): Promise<IUser | null>;
  delete(cc: string): Promise<void>;
}