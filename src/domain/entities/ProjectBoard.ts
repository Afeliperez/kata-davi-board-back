export interface HuItem {
  hu: string;
  descripcion: string;
  status: string;
  codigo: string;
}

export interface ProjectBoard {
  pro: string;
  projectName: string;
  hu: HuItem[];
  accesos: string[];
}

export interface CreateProjectBoard {
  pro: string;
  projectName: string;
  hu: Omit<HuItem, 'codigo'>[];
  accesos: string[];
}

export interface UpdateProjectBoard {
  projectName?: string;
  hu?: Array<Partial<HuItem> & Pick<HuItem, 'hu' | 'descripcion' | 'status'>>;
  accesos?: string[];
}