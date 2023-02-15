import { Request } from 'express';
import { Role, User } from '@interfaces/users.interface';

export interface DataStoredInToken {
  email: string;
  roles: Role[];
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}
