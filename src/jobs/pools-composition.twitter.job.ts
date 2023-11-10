import { Notification, NotificationType } from '@interfaces/notifications.interface';
import NotificationService from '@services/notifications.service';
import * as schedule from 'node-schedule';
import { dexLpNames, percentageFormat, shortCurrencyFormat } from '../utils/helpers';
import { createChart, generateNewsletterTweet, waterMark } from './helpers';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import { logger } from "@/config/logger";
import { RecurringJob } from "@/jobs/job.manager";

export class PoolsCompositionTwitterJob implements RecurringJob {
  private readonly job: schedule.Job;
  public notificationService = new NotificationService();

  constructor() {
    logger.info('Scheduling PoolsCompositionTwitterJob');
    this.job = schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 15, tz: 'Etc/UTC' }, () => {
      logger.info('Executing PoolsCompositionTwitterJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing PoolsCompositionTwitterJob', e);
      });
    });
  }

  public async executeJob(): Promise<void> {
    const notifications: Notification[] = await this.notificationService.notifications
      .find({
        type: NotificationType.LP_COMPOSITION_CHANGE,
        createdAt: {
          $gt: new Date(Date.now() - 14_400_000), // 4 hours
        },
      })
      .populate('token')
      .populate('liquidityPool');

    logger.info('PoolsCompositionTwitterJob notifications', notifications);

    if (notifications.length === 0) {
      return;
    }

    const twitterClient = new TwitterApi({
      appKey: process.env.CHAINKRAFTCOM_APP_KEY,
      appSecret: process.env.CHAINKRAFTCOM_APP_SECRET,
      accessToken: process.env.CHAINKRAFTCOM_ACCESS_TOKEN,
      accessSecret: process.env.CHAINKRAFTCOM_ACCESS_SECRET,
    });

    const groupedNotifications = this.groupNotificationsByLp(notifications);

    Array.from(groupedNotifications, async ([lpId, notifications]) => {
      const tweetText = this.constructTweet(lpId, notifications);

      const chartBuffer = await createChart(
        `https://analytics.chainkraft.com/pools/ethereum/${notifications[0].liquidityPool.address}?chart=hour`,
        { width: 1280, height: 720 },
        '#chart-with-header-container',
      );
      const watermarkedBuffer = await waterMark(chartBuffer);

      const mediaId = await twitterClient.v1.uploadMedia(watermarkedBuffer, { mimeType: EUploadMimeType.Png });

      const tweets = [
        { text: tweetText, media: { media_ids: [mediaId] } }, // First tweet with chart
        { text: generateNewsletterTweet() }, // Second tweet for newsletter
      ];

      const result = await twitterClient.v2.tweetThread(tweets);
      logger.info(result.map(tweet => tweet.data.text).join('\n'));
    });
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
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
