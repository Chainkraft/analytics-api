import { Notification } from '@interfaces/notifications.interface';
import { Types } from 'mongoose';

export class NotificationPageDto {
  data: Notification[];
  count: number;
  currentPage: number;
}

export class NotificationSubscribeDto {
  token?: Types.ObjectId;
  protocol?: Types.ObjectId;
}

export class NotificationSubscriptionsDto {
  tokens: Types.ObjectId[];
  protocols: Types.ObjectId[];
}
