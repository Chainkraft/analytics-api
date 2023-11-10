import { NextFunction, Response } from 'express';
import NotificationService from '@services/notifications.service';
import { RequestWithUser } from '@interfaces/auth.interface';
import { NotificationSubscribeDto } from '@dtos/notifications.dto';
import { isEmpty } from '@utils/util';

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

  public getUserSubscriptions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await this.notificationService.findUserSubscriptions(req.user);
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  public subscribeUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const subscribeDto: NotificationSubscribeDto = req.body;
      if (!isEmpty(subscribeDto)) {
        await this.notificationService.subscribeUser(req.user, subscribeDto);
      }

      res.status(201).end();
    } catch (error) {
      next(error);
    }
  };

  public unsubscribeUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const subscribeDto: NotificationSubscribeDto = req.body;
      if (!isEmpty(subscribeDto)) {
        await this.notificationService.unsubscribeUser(req.user, subscribeDto);
      }

      res.status(200).end();
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationsController;
