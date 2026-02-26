import { ICreateUser, Role, IUser } from '../../../../../domain/entities/User';

export interface IUserItem {
  cc: string;
  email: string;
  password?: string;
  userName: string;
  role: Role;
}

export class UserItemMapper {
  static toDomain(item: IUserItem): IUser {
    return {
      cc: item.cc,
      email: item.email,
      userName: item.userName,
      role: item.role
    };
  }

  static toCreateUser(item: IUserItem): ICreateUser | null {
    if (!item.password) {
      return null;
    }

    return {
      cc: item.cc,
      email: item.email,
      password: item.password,
      userName: item.userName,
      role: item.role
    };
  }

  static toItem(user: ICreateUser): IUserItem {
    return {
      cc: user.cc,
      email: user.email,
      password: user.password,
      userName: user.userName,
      role: user.role
    };
  }
}