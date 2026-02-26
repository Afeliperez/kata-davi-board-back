export interface IHuItem {
  hu: string;
  descripcion: string;
  status: string;
  codigo: string;
}

export interface IProjectBoard {
  pro: string;
  projectName: string;
  hu: IHuItem[];
  accesos: string[];
}

export interface ICreateProjectBoard {
  pro: string;
  projectName: string;
  hu: Omit<IHuItem, 'codigo'>[];
  accesos: string[];
}

export interface IUpdateProjectBoard {
  projectName?: string;
  hu?: Array<Partial<IHuItem> & Pick<IHuItem, 'hu' | 'descripcion' | 'status'>>;
  accesos?: string[];
}