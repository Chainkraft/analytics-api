import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import SubscribersController from '@/controllers/subscribers.controller';

class SubscribersRoute implements Routes {
  public path = '/subscribers';
  public router = Router();
  public subscribersController = new SubscribersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/alerting`, this.subscribersController.createSubscriber);
    this.router.post(`${this.path}/request-access`, this.subscribersController.saveAccessRequest);
  }
}

export default SubscribersRoute;
