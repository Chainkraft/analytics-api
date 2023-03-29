import { RecurringJob } from './recurring.job';
import * as schedule from 'node-schedule';
import NotificationService from '@services/notifications.service';
import { Notification, NotificationSeverity, NotificationStablecoinDepegDataSchema, NotificationType } from '@interfaces/notifications.interface';

export class PoolsCompositionNotificationsJob implements RecurringJob {
  public notificationService = new NotificationService();

  doIt(): any {
    console.log('Scheduling PoolsCompositionNotificationsJob');
    schedule.scheduleJob({ hour: 12, minute: 10, tz: 'Etc/UTC' }, () => this.generateNotifications());
  }

  async generateNotifications(): Promise<any> {
    return;
  }
}
