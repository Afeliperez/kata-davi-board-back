 export enum Role {
  ADMIN = 'ADMIN',
  PO = 'PO',
  SM = 'SM',
  DEV = 'DEV',
  QA = 'QA'
}

export interface IUser {
	cc: string;
	email: string;
	userName: string;
	role: Role;
}

export interface ICreateUser extends IUser {
	password: string;
}



