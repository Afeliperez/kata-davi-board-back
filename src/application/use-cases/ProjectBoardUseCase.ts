import { randomUUID } from 'crypto';
import {
  CreateProjectBoard,
  HuItem,
  ProjectBoard,
  UpdateProjectBoard
} from '../../domain/entities/ProjectBoard';
import { IProjectBoardUseCase } from '../../domain/repositories/Contracts';
import { ProjectBoardRepository } from '../../domain/repositories/ProjectBoardRepository';

export class ProjectBoardUseCase implements IProjectBoardUseCase {
  constructor(private readonly projectBoardRepository: ProjectBoardRepository) {}

  async create(projectBoard: CreateProjectBoard): Promise<void> {
    const model: ProjectBoard = {
      pro: projectBoard.pro,
      projectName: projectBoard.projectName,
      accesos: projectBoard.accesos,
      hu: this.normalizeNewHu(projectBoard.hu)
    };

    await this.projectBoardRepository.create(model);
  }

  async listAll(): Promise<ProjectBoard[]> {
    return this.projectBoardRepository.listAll();
  }

  async getByPro(pro: string): Promise<ProjectBoard | null> {
    return this.projectBoardRepository.getByPro(pro);
  }

  async update(pro: string, data: UpdateProjectBoard): Promise<ProjectBoard | null> {
    const updateData: UpdateProjectBoard = {
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

  private normalizeNewHu(items: Array<Omit<HuItem, 'codigo'>>): HuItem[] {
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