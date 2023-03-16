import { Notification } from '@interfaces/notifications.interface';

export class NotificationPageDto {
  data: Notification[];
  count: number;
  currentPage: number;
}
