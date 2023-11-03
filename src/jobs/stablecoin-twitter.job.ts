import { RecurringJob } from './recurring.job';
import { currencyFormat } from '../utils/helpers';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import NotificationService from '@services/notifications.service';
import * as schedule from 'node-schedule';
import { Notification, NotificationStablecoinDepegDataSchema, NotificationType } from '@interfaces/notifications.interface';
import { createChart, waterMark } from './helpers';

export class StablecoinTwitterJob implements RecurringJob {
  public notificationService = new NotificationService();

  doIt(): any {
    console.log('Scheduling StablecoinTwitterJob');
    schedule.scheduleJob({ hour: 13, minute: 0, tz: 'Etc/UTC' }, () => this.generateTweets());
  }

  async generateTweets() {
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

    console.log('StablecoinTwitterJob notifications', filteredNotifications);

    for (let i = 0; i < Math.ceil(filteredNotifications.length / 5); i++) {
      const partialNotifications = filteredNotifications.slice(i * 5, i * 5 + 5);

      let firstTweet = `🚨 #Stablecoins with a recent price drop:\n`;

      for (const depeg of partialNotifications) {
        const data: NotificationStablecoinDepegDataSchema = depeg.data;
        firstTweet += `\n$${depeg.token.symbol} ${currencyFormat(data.price.toString(), 3)} USD`;
      }

      firstTweet += `\n\nDetails 👇\n\n#DeFi #crypto`;

      const tweets = [];
      tweets.push({ text: firstTweet });
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
        tweets.push({ text: tweet, media: { media_ids: [mediaId] } });
      }
      console.log(await twitterClient.v2.tweetThread(tweets));
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
