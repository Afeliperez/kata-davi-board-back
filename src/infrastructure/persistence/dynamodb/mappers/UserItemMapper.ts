import { CreateUser, Role, User } from '../../../../domain/entities/User';

export interface UserItem {
  cc: string;
  email: string;
  password?: string;
  userName: string;
  role: Role;
}

export class UserItemMapper {
  static toDomain(item: UserItem): User {
    return {
      cc: item.cc,
      email: item.email,
      userName: item.userName,
      role: item.role
    };
  }

  static toCreateUser(item: UserItem): CreateUser | null {
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

  static toItem(user: CreateUser): UserItem {
    return {
      cc: user.cc,
      email: user.email,
      password: user.password,
      userName: user.userName,
      role: user.role
    };
  }
}