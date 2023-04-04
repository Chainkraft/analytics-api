import { Notification } from '@interfaces/notifications.interface';
import notificationsModel from '@models/notifications.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import { NotificationPageDto } from '@dtos/notifications.dto';
import { User } from '@interfaces/users.interface';

class NotificationService {
  public notifications = notificationsModel;

  public async findNotifications(user: User, page: number, limit = 100): Promise<NotificationPageDto> {
    const currentPage = page < 0 ? 0 : page;
    const where = {
      createdAt: { $gt: user.createdAt },
      $or: [{ user: { $eq: null } }, { user: { $eq: user._id } }],
    };

    const notifications = await this.notifications
      .find(where)
      .sort({
        createdAt: 'desc',
      })
      .populate('token')
      .populate('contract')
      .populate('liquidityPool')
      .skip(currentPage * limit)
      .limit(limit);

    const count = await this.notifications.count(where);

    return {
      data: notifications,
      count: count,
      currentPage: currentPage,
    };
  }

  public async createNotification(notification: Notification): Promise<Notification> {
    if (isEmpty(notification)) throw new HttpException(400, 'Notification is empty');
    if (isEmpty(notification.user) && isEmpty(notification.token) && isEmpty(notification.contract) && isEmpty(notification.liquidityPool)) {
      throw new HttpException(400, 'Notification subject is empty');
    }
    return await this.notifications.create(notification);
  }
}

export default NotificationService;
