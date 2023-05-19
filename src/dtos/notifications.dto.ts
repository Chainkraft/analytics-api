import { Notification } from '@interfaces/notifications.interface';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class NotificationPageDto {
  data: Notification[];
  count: number;
  currentPage: number;
}

export class NotificationSubscribeDto {
  @IsNotEmpty()
  token: Types.ObjectId;
}

export class NotificationSubscriptionsDto {
  tokens: Types.ObjectId[];
}
