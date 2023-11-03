import { Notification, NotificationType } from '@interfaces/notifications.interface';
import NotificationService from '@services/notifications.service';
import * as schedule from 'node-schedule';
import { dexLpNames, percentageFormat, shortCurrencyFormat } from '../utils/helpers';
import { createChart, waterMark } from './helpers';
import { RecurringJob } from './recurring.job';

export class PoolsCompositionTwitterJob implements RecurringJob {
  public notificationService = new NotificationService();

  doIt(): any {
    console.log('Scheduling PoolsCompositionTwitterJob');
    schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 15, tz: 'Etc/UTC' }, () => this.generateTweets());
  }

  async generateTweets() {
    const notifications: Notification[] = await this.notificationService.notifications
      .find({
        type: NotificationType.LP_COMPOSITION_CHANGE,
        createdAt: {
          $gt: new Date(Date.now() - 86_400_000),
        },
      })
      .populate('token')
      .populate('liquidityPool');

    if (notifications.length === 0) {
      return;
    }

    const groupedNotifications = this.groupNotificationsByLp(notifications);

    console.log('PoolsCompositionTwitterJob notifications', groupedNotifications);

    const tweetsArray = Array.from(groupedNotifications, ([lpId, notifications]) => this.constructTweet(lpId, notifications));

    Array.from(groupedNotifications, async ([lpId, notifications]) => {
      this.constructTweet(lpId, notifications);
      const chartBuffer = await createChart(
        `https://analytics.chainkraft.com/pools/ethereum/${notifications[0].liquidityPool.address}?chart=hour`,
        { width: 1280, height: 720 },
        '#chart-with-header-container',
      );
      const watermarkedBuffer = await waterMark(chartBuffer);
    });

    console.log('PoolsCompositionTwitterJob tweets: ');
    tweetsArray.forEach((tweet, index) => {
      console.log(`${tweet}`);
    });
  }

  private constructTweet(lpId: string, notifications: Notification[]): string {
    // Generating the token data lines
    const tokenDataLines = notifications
      .map(notification => {
        const { token, weight, weightChange, balance } = notification.data;
        return `$${token}: ${percentageFormat(weight, 100)} (${percentageFormat(weightChange, 100)}) → ${shortCurrencyFormat(balance)}`;
      })
      .join('\n');

    // Constructing the tweet
    const pairNames = notifications.map(notification => notification.data.token).join('/');

    const tweet =
      `🔄 ${dexLpNames[notifications[0].liquidityPool.dex]} ${pairNames} LP balance shift:\n\n` +
      tokenDataLines +
      '\n\n' +
      `Pool size: ${shortCurrencyFormat(notifications[0].liquidityPool.tvlUSD)}\n\n` +
      `📊 https://analytics.chainkraft.com/pools/ethereum/${notifications[0].liquidityPool.address}?chart=hour` +
      '\n\n' +
      '#DeFi #ethereum';

    return tweet;
  }

  private groupNotificationsByLp(notifications: Notification[]): Map<string, Notification[]> {
    const lpNotificationsMap = new Map<string, Notification[]>();

    notifications.forEach(notification => {
      const lpId = notification.liquidityPool._id.toString();

      // Get the existing array of notifications for this liquidity pool, or create a new array if it doesn't exist
      let notificationsArray = lpNotificationsMap.get(lpId);
      if (!notificationsArray) {
        notificationsArray = []; // Initialize a new array
        lpNotificationsMap.set(lpId, notificationsArray); // Add the new array to the map
      }

      // Add the notification to the array for this liquidity pool
      notificationsArray.push(notification);
    });

    return lpNotificationsMap;
  }
}
