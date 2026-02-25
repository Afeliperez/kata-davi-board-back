 export enum Role {
  ADMIN = 'ADMIN',
  PO = 'PO',
  SM = 'SM',
  DEV = 'DEV',
  QA = 'QA'
}

export interface User {
	cc: string;
	email: string;
	userName: string;
	role: Role;
}

export interface CreateUser extends User {
	password: string;
}



