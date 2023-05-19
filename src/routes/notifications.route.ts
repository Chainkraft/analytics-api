import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import NotificationsController from '@controllers/notifications.controller';
import { hasRole } from '@middlewares/auth.middleware';
import { Role } from '@interfaces/users.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { NotificationSubscribeDto } from '@dtos/notifications.dto';

class NotificationsRoute implements Routes {
  public path = '/notifications';
  public router = Router();
  public notificationsController = new NotificationsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, [hasRole(Role.USER)], this.notificationsController.getNotifications);
    this.router.get(`${this.path}/subscriptions`, [hasRole(Role.USER)], this.notificationsController.getUserSubscriptions);
    this.router.post(
      `${this.path}/subscriptions`,
      [validationMiddleware(NotificationSubscribeDto, 'body'), hasRole(Role.USER)],
      this.notificationsController.subscribeUser,
    );
    this.router.delete(
      `${this.path}/subscriptions`,
      [validationMiddleware(NotificationSubscribeDto, 'body'), hasRole(Role.USER)],
      this.notificationsController.unsubscribeUser,
    );
  }
}

export default NotificationsRoute;
