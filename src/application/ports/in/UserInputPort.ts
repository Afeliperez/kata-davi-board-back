import { ICreateUser, IUser } from '@domain/entities/User';

export interface ILoginResult {
  user: IUser;
  token: string;
}

export interface IUserInputPort {
  create(user: ICreateUser): Promise<void>;
  listAll(): Promise<IUser[]>;
  login(cc: string, password: string): Promise<ILoginResult | null>;
  update(cc: string, data: Partial<ICreateUser>): Promise<IUser | null>;
  delete(cc: string): Promise<void>;
}