import { Notification } from '@interfaces/notifications.interface';
import notificationsModel from '@models/notifications.model';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import { ObjectId } from 'mongoose';

class NotificationService {
  public notifications = notificationsModel;

  public async findNotifications(page: number, user: ObjectId, limit = 100): Promise<Notification[]> {
    return this.notifications
      .find({
        $or: [{ user: { $eq: null } }, { user: { $eq: user } }],
      })
      .select('-data')
      .sort({
        createdAt: 'desc',
      })
      .populate('token')
      .populate('contract')
      .skip((page > 0 ? page : 0) * limit)
      .limit(limit);
  }

  public async createNotification(notification: Notification): Promise<Notification> {
    if (isEmpty(notification)) throw new HttpException(400, 'Notification is empty');
    if (isEmpty(notification.user) && isEmpty(notification.token) && isEmpty(notification.contract)) {
      throw new HttpException(400, 'Notification subject is empty');
    }
    return await this.notifications.create(notification);
  }
}

export default NotificationService;
