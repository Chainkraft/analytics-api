import { RecurringJob } from './recurring.job';
import { currencyFormat } from '../utils/helpers';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import Jimp from 'jimp';
import { ChartConfiguration } from 'chart.js';
import NotificationService from '@services/notifications.service';
import * as schedule from 'node-schedule';
import { Notification, NotificationStablecoinDepegDataSchema, NotificationType } from '@interfaces/notifications.interface';

const ChartJsImage = require('chartjs-to-image');

export class StablecoinTwitterJob implements RecurringJob {
  public notificationService = new NotificationService();

  doIt(): any {
    console.log('Scheduling StablecoinTwitterJob');
    schedule.scheduleJob({ hour: 13, minute: 0 }, () => this.generateTweets());
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

      firstTweet += `\n\nDetails 👇`;

      const tweets = [];
      tweets.push({ text: firstTweet });
      for (const depeg of partialNotifications) {
        const data: NotificationStablecoinDepegDataSchema = depeg.data;
        const tweet =
          `${depeg.token.name} $${depeg.token.symbol}` +
          `\nCurrent price: ${currencyFormat(data.price.toString(), 3)} USD` +
          `\nChain: #${data.chains[0]}` +
          `\n\nhttps://analytics.chainkraft.com/tokens/${depeg.token.slug}`;

        const chartBuffer = await this.createChart(depeg, 14);

        const watermarkedBuffer = await this.waterMark(chartBuffer);

        const mediaId = await twitterClient.v1.uploadMedia(watermarkedBuffer, { mimeType: EUploadMimeType.Png });
        tweets.push({ text: tweet, media: { media_ids: [mediaId] } });
      }
      console.log(await twitterClient.v2.tweetThread(tweets));
    }
  }

  private async waterMark(input: Buffer) {
    const chart = await Jimp.read(input);
    const watermark = await Jimp.read('static/logo.png');

    watermark.resize(chart.bitmap.width / 4, Jimp.AUTO);

    chart.composite(watermark, chart.getWidth() / 2 - watermark.getWidth() / 2, chart.getHeight() / 2 - watermark.getHeight() / 2, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.3,
    });

    return await chart.getBufferAsync(chart.getMIME());
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

  private async createChart(depeg: Notification, numberOfDays = 7) {
    const data: NotificationStablecoinDepegDataSchema = depeg.data;
    const dates = [...Array(numberOfDays)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    });

    const chartPrices = data.prices.reverse();
    chartPrices.pop();
    chartPrices.push(data.price);

    const width = 800;
    const height = 480;
    const textColor = 'white';
    const configuration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: dates.reverse(),
        datasets: [
          {
            label: depeg.token.name,
            data: chartPrices,
          },
        ],
      },
      options: {
        layout: {
          padding: 30,
        },
        elements: {
          point: {
            radius: 0,
            backgroundColor: '#F9A822',
          },
          line: {
            borderWidth: 4,
            borderColor: '#F9A822',
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: {
                size: 14,
              },
            },
            grid: {
              borderColor: textColor,
            },
          },
          y: {
            suggestedMax: Math.max(...chartPrices) + 0.05,
            suggestedMin: Math.min(...chartPrices) - 0.02,
            ticks: {
              color: textColor,
              font: {
                size: 14,
              },
            },
            grid: {
              borderColor: textColor,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: depeg.token.name,
            color: textColor,
            font: {
              size: 16,
            },
          },
          legend: {
            display: false,
          },
        },
      },
    };

    const chart = new ChartJsImage();
    chart.setConfig(configuration);
    chart.setWidth(width);
    chart.setHeight(height);
    chart.setChartJsVersion('3.9.1');
    chart.setBackgroundColor('#1A1A2E');

    return await chart.toBinary();
  }
}
