import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  email: string;
  password: string;
  roles: Role[];
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
