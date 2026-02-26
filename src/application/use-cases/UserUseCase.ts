import { ICreateUser, IUser } from '@domain/entities/User';
import { IUserRepository } from '@domain/repositories/userRepository';
import { ITokenService } from '@domain/services/tokenService';
import { ILoginResult, IUserInputPort } from '@application/ports/in/userInputPort';
import { rethrowWithContext } from '@shared/errors/rethrowWithContext';

export class UserUseCase implements IUserInputPort {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async create(user: ICreateUser): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(user.password);
      const userToCreate: ICreateUser = {
        ...user,
        password: hashedPassword
      };
      await this.userRepository.create(userToCreate);
    } catch (error) {
      throw rethrowWithContext(error, 'UserUseCase.create');
    }
  }

  async listAll(): Promise<IUser[]> {
    return this.userRepository.listAll();
  }

  async login(cc: string, password: string): Promise<ILoginResult | null> {
    try {
      const userWithPassword = await this.userRepository.getByCcWithPassword(cc);

      if (!userWithPassword || !(await this.verifyPassword(password, userWithPassword.password))) {
        return null;
      }

      const user: IUser = {
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
    } catch (error) {
      throw rethrowWithContext(error, 'UserUseCase.login');
    }
  }

  async update(cc: string, data: Partial<ICreateUser>): Promise<IUser | null> {
    try {
      if (!data.password) {
        return this.userRepository.update(cc, data);
      }

      const hashedPassword = await this.hashPassword(data.password);

      return this.userRepository.update(cc, {
        ...data,
        password: hashedPassword
      });
    } catch (error) {
      throw rethrowWithContext(error, 'UserUseCase.update');
    }
  }

  async delete(cc: string): Promise<void> {
    try {
      await this.userRepository.delete(cc);
    } catch (error) {
      throw rethrowWithContext(error, 'UserUseCase.delete');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return this.tokenService.hashPassword(password);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return this.tokenService.verifyPassword(password, hashedPassword);
  }
}