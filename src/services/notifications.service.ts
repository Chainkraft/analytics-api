import { Notification, NotificationType } from "@interfaces/notifications.interface";
import notificationsModel from "@models/notifications.model";
import { isEmpty } from "@utils/util";
import { HttpException } from "@/exceptions/HttpException";

class NotificationService {
  public notifications = notificationsModel;

  public async createNotification(notification: Notification): Promise<Notification> {
    if (isEmpty(notification)) throw new HttpException(400, "Notification is empty");
    if (isEmpty(notification.user) && isEmpty(notification.token) && isEmpty(notification.contract)) {
      throw new HttpException(400, "Notification subject is empty");
    }
    return await this.notifications.create(notification);
  }
}

export default NotificationService;
