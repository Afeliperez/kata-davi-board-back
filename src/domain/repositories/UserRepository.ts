import { CreateUser, User } from '../entities/User';

export interface UserRepository {
  create(user: CreateUser): Promise<void>;
  listAll(): Promise<User[]>;
  getByCcWithPassword(cc: string): Promise<CreateUser | null>;
  getByCc(cc: string): Promise<User | null>;
  update(cc: string, data: Partial<CreateUser>): Promise<User | null>;
  delete(cc: string): Promise<void>;
}