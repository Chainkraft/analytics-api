import { currencyFormat } from '../utils/helpers';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import NotificationService from '@services/notifications.service';
import * as schedule from 'node-schedule';
import { Notification, NotificationStablecoinDepegDataSchema, NotificationType } from '@interfaces/notifications.interface';
import { createChart, generateNewsletterTweet, waterMark } from './helpers';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';
import { SocialMedia } from '@/interfaces/socia-media-post.interface';
import SocialMediaPostService from '@/services/social-media-post.service';

export class StablecoinTwitterJob implements RecurringJob {
  private readonly job: schedule.Job;
  private notificationService = new NotificationService();
  private socialMediaPostService = new SocialMediaPostService();

  constructor() {
    logger.info('Scheduling StablecoinTwitterJob');
    this.job = schedule.scheduleJob({ hour: 13, minute: 0, tz: 'Etc/UTC' }, () => {
      logger.info('Executing StablecoinTwitterJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing StablecoinTwitterJob', e);
      });
    });
  }

  public async executeJob(): Promise<void> {
    const notifications: Notification[] = await this.notificationService.notifications
      .find({
        type: NotificationType.STABLECOIN_DEPEG,
        createdAt: {
          $gt: new Date(Date.now() - 86_400_000),
        },
      })
      .populate('token');

    if (notifications.length === 0) {
      return;
    }

    const twitterClient = new TwitterApi({
      appKey: process.env.STABLEALERTS_APP_KEY,
      appSecret: process.env.STABLEALERTS_APP_SECRET,
      accessToken: process.env.STABLEALERTS_ACCESS_TOKEN,
      accessSecret: process.env.STABLEALERTS_ACCESS_SECRET,
    });

    const filteredNotifications = this.filterNotifcationsForTweet(notifications);

    logger.info('StablecoinTwitterJob notifications', filteredNotifications);

    for (let i = 0; i < Math.ceil(filteredNotifications.length / 5); i++) {
      const partialNotifications = filteredNotifications.slice(i * 5, i * 5 + 5);

      let firstTweet = `🚨 #Stablecoins with a recent price drop:\n`;

      for (const depeg of partialNotifications) {
        const data: NotificationStablecoinDepegDataSchema = depeg.data;
        firstTweet += `\n$${depeg.token.symbol} ${currencyFormat(data.price.toString(), 3)} USD`;
      }

      firstTweet += `\n\nDetails 👇\n\n#DeFi #crypto`;

      const tweets = [];
      const smPosts = [];
      tweets.push({ text: firstTweet });
      smPosts.push({ text: firstTweet });
      for (const depeg of partialNotifications) {
        const data: NotificationStablecoinDepegDataSchema = depeg.data;
        const tweet =
          `${depeg.token.name} $${depeg.token.symbol}` +
          `\nCurrent price: ${currencyFormat(data.price.toString(), 3)} USD` +
          `\nChain: #${data.chains[0]}` +
          `\n\nhttps://analytics.chainkraft.com/tokens/${depeg.token.slug}`;

        const chartBuffer = await createChart(
          `https://analytics.chainkraft.com/charts/token/${depeg.token.slug}`,
          { width: 1280, height: 720 },
          '#price-chart-with-header',
        );
        const watermarkedBuffer = await waterMark(chartBuffer);
        const mediaId = await twitterClient.v1.uploadMedia(watermarkedBuffer, { mimeType: EUploadMimeType.Png });
        smPosts.push({ text: tweet, image: { data: watermarkedBuffer, contentType: EUploadMimeType.Png } });
        tweets.push({ text: tweet, media: { media_ids: [mediaId] } });
      }
      tweets.push({ text: generateNewsletterTweet() });
      const result = await twitterClient.v2.tweetThread(tweets);
      logger.info(result.map(tweet => tweet.data.text).join('\n'));

      // Iterate over smPosts and save each to the database
      for (const smPost of smPosts) {
        await this.socialMediaPostService.saveSocialMediaPost({
          socialMedia: SocialMedia.TWITTER,
          account: 'stablealerts', // Update with the correct account name if needed
          text: smPost.text,
          images: smPost.image ? [smPost.image] : [],
        });
      }
    }
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
  }

  private filterNotifcationsForTweet(notifications: Notification[]): Notification[] {
    const uniqueTokens = new Map<string, Notification>();
    // create a new Map() to store the latest Notification for each unique token

    notifications.forEach(notification => {
      if (notification.token) {
        if (!uniqueTokens.has(notification.token.slug)) {
          // if the token is not in the Map, add the current Notification to the Map
          uniqueTokens.set(notification.token.slug, notification);
        } else {
          // if the token is in the Map, check if the createdAt time is greater than the previous Notification for that token
          const existingNotification = uniqueTokens.get(notification.token.slug);
          if (
            existingNotification &&
            notification.updatedAt &&
            existingNotification.updatedAt &&
            notification.updatedAt > existingNotification.updatedAt
          ) {
            uniqueTokens.set(notification.token.slug, notification);
          }
        }
      }
    });

    const latestNotificationsArray = Array.from(uniqueTokens.values());
    // convert the Map to an array of the latest Notifications
    return latestNotificationsArray;
  }
}
