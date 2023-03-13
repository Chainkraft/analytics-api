import { NextFunction, Request, Response } from 'express';
import NotificationService from '@services/notifications.service';
import { RequestWithUser } from '@interfaces/auth.interface';

class NotificationsController {
  public notificationService = new NotificationService();

  public getNotifications = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const page = parseInt(<string>req.query.page);
      const notifications = await this.notificationService.findNotifications(page, user._id);
      res.json({ data: notifications });
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationsController;
