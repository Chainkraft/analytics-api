import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '@models/users.model';
import { Role, User } from '@interfaces/users.interface';

const getUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (authorization) {
      const secretKey: string = JWT_SECRET_KEY;
      const verificationResponse = (await verify(authorization, secretKey)) as DataStoredInToken;
      const findUser = await userModel.findOne({ email: verificationResponse.email });

      if (findUser) {
        req.user = findUser;
      }
    }
    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

const hasRole = (value: Role) => {
  return async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user: User = req.user;
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

export const authMiddleware = {
  getUser,
  hasRole,
};
