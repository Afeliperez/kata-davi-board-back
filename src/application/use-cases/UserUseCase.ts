import { CreateUser, User } from '../../domain/entities/User';
import { LoginResult, IUserUseCase } from '../../domain/repositories/Contracts';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { TokenService } from '../../domain/services/TokenService';

export class UserUseCase implements IUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  async create(user: CreateUser): Promise<void> {
    const hashedPassword = await this.hashPassword(user.password);
    const userToCreate: CreateUser = {
      ...user,
      password: hashedPassword
    };
    await this.userRepository.create(userToCreate);
  }

  async listAll(): Promise<User[]> {
    return this.userRepository.listAll();
  }

  async login(cc: string, password: string): Promise<LoginResult | null> {
    const userWithPassword = await this.userRepository.getByCcWithPassword(cc);

    if (!userWithPassword || !(await this.verifyPassword(password, userWithPassword.password))) {
      return null;
    }

    const user: User = {
      cc: userWithPassword.cc,
      email: userWithPassword.email,
      userName: userWithPassword.userName,
      role: userWithPassword.role
    };

    const token = this.tokenService.sign({
      cc: user.cc,
      role: user.role
    });

    return {
      user,
      token
    };
  }

  async update(cc: string, data: Partial<CreateUser>): Promise<User | null> {
    if (!data.password) {
      return this.userRepository.update(cc, data);
    }

    const hashedPassword = await this.hashPassword(data.password);

    return this.userRepository.update(cc, {
      ...data,
      password: hashedPassword
    });
  }

  async delete(cc: string): Promise<void> {
    await this.userRepository.delete(cc);
  }

  private async hashPassword(password: string): Promise<string> {
    return this.tokenService.hashPassword(password);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return this.tokenService.verifyPassword(password, hashedPassword);
  }
}