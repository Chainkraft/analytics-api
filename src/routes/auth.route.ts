import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { hasRole } from '@middlewares/auth.middleware';
import { Role } from '@interfaces/users.interface';

class AuthRoute implements Routes {
  public path = '/auth/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, [hasRole(Role.ADMIN), validationMiddleware(CreateUserDto, 'body')], this.authController.signUp);
    this.router.post(`${this.path}login`, [validationMiddleware(CreateUserDto, 'body')], this.authController.logIn);
    this.router.post(`${this.path}logout`, [], this.authController.logOut);
  }
}

export default AuthRoute;
