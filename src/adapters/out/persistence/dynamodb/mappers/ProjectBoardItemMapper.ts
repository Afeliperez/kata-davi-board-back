import { IProjectBoard } from '@domain/entities/ProjectBoard';

export interface IProjectBoardItem {
  pro: string;
  'project-name': string;
  hu: IProjectBoard['hu'];
  accesos: string[];
}

export class ProjectBoardItemMapper {
  static toDomain(item: IProjectBoardItem): IProjectBoard {
    return {
      pro: item.pro,
      projectName: item['project-name'],
      hu: item.hu,
      accesos: item.accesos
    };
  }

  static toItem(projectBoard: IProjectBoard): IProjectBoardItem {
    return {
      pro: projectBoard.pro,
      'project-name': projectBoard.projectName,
      hu: projectBoard.hu,
      accesos: projectBoard.accesos
    };
  }
}