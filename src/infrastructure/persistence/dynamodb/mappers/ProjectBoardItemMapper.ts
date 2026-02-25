import { ProjectBoard } from '../../../../domain/entities/ProjectBoard';

export interface ProjectBoardItem {
  pro: string;
  'project-name': string;
  hu: ProjectBoard['hu'];
  accesos: string[];
}

export class ProjectBoardItemMapper {
  static toDomain(item: ProjectBoardItem): ProjectBoard {
    return {
      pro: item.pro,
      projectName: item['project-name'],
      hu: item.hu,
      accesos: item.accesos
    };
  }

  static toItem(projectBoard: ProjectBoard): ProjectBoardItem {
    return {
      pro: projectBoard.pro,
      'project-name': projectBoard.projectName,
      hu: projectBoard.hu,
      accesos: projectBoard.accesos
    };
  }
}