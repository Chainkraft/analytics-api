import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import NotificationsController from '@controllers/notifications.controller';
import { hasRole } from '@middlewares/auth.middleware';
import { Role } from '@interfaces/users.interface';

class NotificationsRoute implements Routes {
  public path = '/notifications';
  public router = Router();
  public notificationsController = new NotificationsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, [hasRole(Role.USER)], this.notificationsController.getNotifications);
  }
}

export default NotificationsRoute;
