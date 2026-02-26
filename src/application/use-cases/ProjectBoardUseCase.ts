import { randomUUID } from 'crypto';
import {
  ICreateProjectBoard,
  IHuItem,
  IProjectBoard,
  IUpdateProjectBoard
} from '../../domain/entities/ProjectBoard';
import { IProjectBoardRepository } from '../../domain/repositories/projectBoardRepository';
import { IProjectBoardInputPort } from '../ports/in/projectBoardInputPort';

export class ProjectBoardUseCase implements IProjectBoardInputPort {
  constructor(private readonly projectBoardRepository: IProjectBoardRepository) {}

  async create(projectBoard: ICreateProjectBoard): Promise<void> {
    const model: IProjectBoard = {
      pro: projectBoard.pro,
      projectName: projectBoard.projectName,
      accesos: projectBoard.accesos,
      hu: this.normalizeNewHu(projectBoard.hu)
    };

    await this.projectBoardRepository.create(model);
  }

  async listAll(): Promise<IProjectBoard[]> {
    return this.projectBoardRepository.listAll();
  }

  async listByAccessCode(accessCode: string): Promise<IProjectBoard[]> {
    return this.projectBoardRepository.listByAccessCode(accessCode);
  }

  async getByPro(pro: string): Promise<IProjectBoard | null> {
    return this.projectBoardRepository.getByPro(pro);
  }

  async update(pro: string, data: IUpdateProjectBoard): Promise<IProjectBoard | null> {
    const updateData: IUpdateProjectBoard = {
      ...data
    };

    if (data.hu) {
      updateData.hu = data.hu.map((item) => ({
        hu: item.hu,
        descripcion: item.descripcion,
        status: item.status,
        codigo: item.codigo ?? this.generateHuCode()
      }));
    }

    return this.projectBoardRepository.update(pro, updateData);
  }

  async delete(pro: string): Promise<void> {
    await this.projectBoardRepository.delete(pro);
  }

  private normalizeNewHu(items: Array<Omit<IHuItem, 'codigo'>>): IHuItem[] {
    return items.map((item) => ({
      hu: item.hu,
      descripcion: item.descripcion,
      status: item.status,
      codigo: this.generateHuCode()
    }));
  }

  private generateHuCode(): string {
    return randomUUID();
  }
}