import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '@models/users.model';
import { Role } from '@interfaces/users.interface';
import { LoggedUserCache } from '@/config/cache';

export const isLogged = (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      next(new HttpException(401, `User not authenticated`));
    } else {
      next();
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export const hasRole = (value: Role) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (user && user.roles.includes(value)) {
        next();
      } else {
        next(new HttpException(401, `Required ${value} role`));
      }
    } catch (error) {
      next(new HttpException(401, 'Wrong authentication token'));
    }
  };
};

export const userContext = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
    if (authorization) {
      const secretKey: string = JWT_SECRET_KEY;
      const verificationResponse = (await verify(authorization, secretKey)) as DataStoredInToken;

      req.user = LoggedUserCache.get(verificationResponse.email);
      if (req.user === undefined) {
        req.user = await userModel.findOne({ email: verificationResponse.email });
        LoggedUserCache.set(verificationResponse.email, req.user);
      }
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
  next();
};
