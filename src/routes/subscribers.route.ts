import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import SubscribersController from '@/controllers/subscribers.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { AccessRequestDto } from '@dtos/subscribers.dto';

class SubscribersRoute implements Routes {
  public path = '/subscribers';
  public router = Router();
  public subscribersController = new SubscribersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, validationMiddleware(AccessRequestDto, 'body'), this.subscribersController.saveAccessRequest);
  }
}

export default SubscribersRoute;
