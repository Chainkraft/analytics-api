import { Notification } from '@interfaces/notifications.interface';
import { isEmpty } from '@utils/util';
import { HttpException } from '@/exceptions/HttpException';
import { NotificationPageDto, NotificationSubscribeDto } from '@dtos/notifications.dto';
import { User } from '@interfaces/users.interface';
import { notificationsModel, notificationSubscriptionsModel } from '@models/notifications.model';
import tokensModel from '@models/tokens.model';
import { Types } from 'mongoose';

class NotificationService {
  public notifications = notificationsModel;
  public notificationSubscriptions = notificationSubscriptionsModel;
  public tokens = tokensModel;

  public async findNotifications(user: User, page: number, limit = 100): Promise<NotificationPageDto> {
    const currentPage = page < 0 ? 0 : page;
    const tokens = await this.findUserSubscriptions(user);
    const where = {
      createdAt: { $gt: user.createdAt },
      $or: [
        {
          $and: [{ user: { $eq: null } }, { token: { $in: tokens } }],
        },
        { user: { $eq: user._id } },
      ],
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

  public async findUserSubscriptions(user: User): Promise<Types.ObjectId[]> {
    const subs = await this.notificationSubscriptions.find({ user: user._id });
    return subs.map(sub => sub.token._id);
  }

  public async subscribeUser(user: User, subscribeDto: NotificationSubscribeDto): Promise<void> {
    if (!(await notificationSubscriptionsModel.exists({ user: user._id, token: subscribeDto.token }))) {
      const token = await tokensModel.findById(subscribeDto.token);
      if (!token) throw new HttpException(400, 'Token does not exists');

      await notificationSubscriptionsModel.create({
        user,
        token,
      });
    }
  }

  public async unsubscribeUser(user: User, subscribeDto: NotificationSubscribeDto): Promise<void> {
    await notificationSubscriptionsModel.deleteOne({ user: user._id, token: subscribeDto.token });
  }
}

export default NotificationService;
