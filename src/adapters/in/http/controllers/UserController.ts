import { Request, Response } from 'express';
import { ICreateUser, Role } from '@domain/entities/User';
import { IUserInputPort } from '@application/ports/in/userInputPort';
import { rethrowWithContext } from '@shared/errors/rethrowWithContext';

type AwsError = Error & { name?: string };

export class UserController {
  constructor(private readonly userUseCase: IUserInputPort) {}

  private getCcFromParams(request: Request): string {
    const { cc } = request.params;

    return Array.isArray(cc) ? cc[0] : cc;
  }

  create = async (request: Request, response: Response): Promise<void> => {
    const { cc, email, password, userName, role } = request.body as ICreateUser;

    if (!cc || !email || !password || !userName || !role) {
      response.status(400).json({ error: 'cc, email, password, userName y role son requeridos' });
      return;
    }

    try {
      await this.userUseCase.create({ cc, email, password, userName, role });

      response.status(201).json({ data: { cc, email, userName, role } });
    } catch (error) {
      const err = error as AwsError;

      if (err.name === 'ConditionalCheckFailedException') {
        response.status(409).json({ error: 'El usuario ya existe' });
        return;
      }

      throw rethrowWithContext(error, 'UserController.create');
    }
  };

  listAll = async (_request: Request, response: Response): Promise<void> => {
    try {
      const users = await this.userUseCase.listAll();

      response.status(200).json({ data: users });
    } catch (error) {
      throw rethrowWithContext(error, 'UserController.listAll');
    }
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const { cc, password } = request.body as {
      cc?: string;
      password?: string;
    };
    if (!cc || !password) {
      response.status(400).json({ error: 'cc y password son requeridos' });
      return;
    }

    try {
      const loginResult = await this.userUseCase.login(cc, password);

      if (!loginResult) {
        response.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      response.status(200).json({ data: loginResult });
    } catch (error) {
      throw rethrowWithContext(error, 'UserController.login');
    }
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const cc = this.getCcFromParams(request);
    const { email, password, userName, role } = request.body as Partial<ICreateUser>;

    if (email === undefined && password === undefined && userName === undefined && role === undefined) {
      response.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' });
      return;
    }

    if (role !== undefined && !Object.values(Role).includes(role)) {
      response.status(400).json({ error: 'Rol no permitido' });
      return;
    }

    try {
      const updatedUser = await this.userUseCase.update(cc, {
        email,
        password,
        userName,
        role
      });

      if (!updatedUser) {
        response.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      response.status(200).json({
        data: {
          cc: updatedUser.cc,
          email: updatedUser.email,
          userName: updatedUser.userName,
          role: updatedUser.role
        }
      });
    } catch (error) {
      const err = error as AwsError;

      if (err.name === 'ConditionalCheckFailedException') {
        response.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      throw rethrowWithContext(error, 'UserController.update');
    }
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    const cc = this.getCcFromParams(request);

    try {
      await this.userUseCase.delete(cc);
      response.status(204).send();
    } catch (error) {
      const err = error as AwsError;

      if (err.name === 'ConditionalCheckFailedException') {
        response.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      throw rethrowWithContext(error, 'UserController.delete');
    }
  };
}