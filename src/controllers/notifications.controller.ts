import { NextFunction, Request, Response } from 'express';
import NotificationService from '@services/notifications.service';
import { RequestWithUser } from '@interfaces/auth.interface';

class NotificationsController {
  public notificationService = new NotificationService();

  public getNotifications = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const page = parseInt(<string>req.query.page) || 0;
      const notifications = await this.notificationService.findNotifications(user, page);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationsController;
