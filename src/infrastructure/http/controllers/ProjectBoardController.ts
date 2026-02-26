import { Request, Response } from 'express';
import {
  ICreateProjectBoard,
  IUpdateProjectBoard
} from '@domain/entities/ProjectBoard';
import { IProjectBoardInputPort } from '@application/ports/in/projectBoardInputPort';

type AwsError = Error & { name?: string };

export class ProjectBoardController {
  constructor(private readonly projectBoardUseCase: IProjectBoardInputPort) {}

  private getProFromParams(request: Request): string {
    const { pro } = request.params;

    return Array.isArray(pro) ? pro[0] : pro;
  }

  private getAccessCodeFromParams(request: Request): string {
    const { accessCode } = request.params;

    return Array.isArray(accessCode) ? accessCode[0] : accessCode;
  }

  private getAccessCodeFromQuery(request: Request): string | undefined {
    const { accessCode } = request.query;

    if (Array.isArray(accessCode)) {
      const firstValue = accessCode[0];

      return typeof firstValue === 'string' ? firstValue : undefined;
    }

    return typeof accessCode === 'string' ? accessCode : undefined;
  }

  create = async (request: Request, response: Response): Promise<void> => {
    const { pro, projectName, hu, accesos } = request.body as ICreateProjectBoard;

    if (!pro || !projectName || !Array.isArray(hu) || !Array.isArray(accesos)) {
      response.status(400).json({
        error: 'pro, projectName, hu[] y accesos[] son requeridos'
      });
      return;
    }

    try {
      await this.projectBoardUseCase.create({
        pro,
        projectName,
        hu,
        accesos
      });

      response.status(201).json({ data: { pro, projectName, hu, accesos } });
    } catch (error) {
      const err = error as AwsError;

      if (err.name === 'ConditionalCheckFailedException') {
        response.status(409).json({ error: 'El project-board ya existe' });
        return;
      }

      throw error;
    }
  };

  listAll = async (request: Request, response: Response): Promise<void> => {
    try {
      const accessCode = this.getAccessCodeFromQuery(request);
      const projectBoards = accessCode
        ? await this.projectBoardUseCase.listByAccessCode(accessCode)
        : await this.projectBoardUseCase.listAll();

      response.status(200).json({ data: projectBoards });
    } catch (error) {
      throw error;
    }
  };

  listByAccessCode = async (request: Request, response: Response): Promise<void> => {
    const accessCode = this.getAccessCodeFromParams(request);

    if (!accessCode) {
      response.status(400).json({ error: 'accessCode es requerido' });
      return;
    }

    try {
      const projectBoards = await this.projectBoardUseCase.listByAccessCode(accessCode);

      response.status(200).json({ data: projectBoards });
    } catch (error) {
      throw error;
    }
  };

  getByPro = async (request: Request, response: Response): Promise<void> => {
    try {
      const pro = this.getProFromParams(request);
      const projectBoard = await this.projectBoardUseCase.getByPro(pro);

      if (!projectBoard) {
        response.status(404).json({ error: 'Project-board no encontrado' });
        return;
      }

      response.status(200).json({ data: projectBoard });
    } catch (error) {
      throw error;
    }
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const pro = this.getProFromParams(request);
    const { projectName, hu, accesos } = request.body as IUpdateProjectBoard;

    if (projectName === undefined && hu === undefined && accesos === undefined) {
      response.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' });
      return;
    }

    try {
      const updatedProjectBoard = await this.projectBoardUseCase.update(pro, {
        projectName,
        hu,
        accesos
      });

      if (!updatedProjectBoard) {
        response.status(404).json({ error: 'Project-board no encontrado' });
        return;
      }

      response.status(200).json({ data: updatedProjectBoard });
    } catch (error) {
      const err = error as AwsError;

      if (err.name === 'ConditionalCheckFailedException') {
        response.status(404).json({ error: 'Project-board no encontrado' });
        return;
      }

      throw error;
    }
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    const pro = this.getProFromParams(request);

    try {
      await this.projectBoardUseCase.delete(pro);
      response.status(204).send();
    } catch (error) {
      const err = error as AwsError;

      if (err.name === 'ConditionalCheckFailedException') {
        response.status(404).json({ error: 'Project-board no encontrado' });
        return;
      }

      throw error;
    }
  };
}