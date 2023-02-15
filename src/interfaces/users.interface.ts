export interface User {
  _id: string;
  email: string;
  password: string;
  roles: Role[];
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
