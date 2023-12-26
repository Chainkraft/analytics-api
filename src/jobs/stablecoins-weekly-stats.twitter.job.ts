import JobStatsService from '@services/job-stats.service';
import { GlobalStats, StablecoinsStats } from '@interfaces/jobs-stats.interface';
import moment from 'moment';
import * as schedule from 'node-schedule';
import { percentageFormat, shortCurrencyFormat } from '@utils/helpers';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import { createChart, waterMark } from './helpers';
import SocialMediaPostService from '@/services/social-media-post.service';
import { SocialMedia } from '@/interfaces/socia-media-post.interface';

export class StablecoinsWeeklyStatsTwitterJob implements RecurringJob {
  private readonly job: schedule.Job;
  private jobStatsService = new JobStatsService();
  private socialMediaPostService = new SocialMediaPostService();

  constructor() {
    logger.info('Scheduling StablecoinsWeeklyStatsTwitterJob');
    this.job = schedule.scheduleJob({ hour: 19, minute: 20, dayOfWeek: 0, tz: 'UTC' }, () => {
      logger.info('Executing StablecoinsWeeklyStatsTwitterJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing StablecoinsWeeklyStatsTwitterJob', e);
      });
    });
  }

  public async executeJob(): Promise<void> {
    // Fetch stablecoins stats for today and 7 days ago
    const todayId = moment().format('YYYY-MM-DD');
    const weekAgoId = moment().subtract(7, 'days').format('YYYY-MM-DD');

    const latestStablecoinStats: StablecoinsStats = await this.jobStatsService.getStablecoinsStats(todayId);
    const weekAgoStablecoinStats: StablecoinsStats = await this.jobStatsService.getStablecoinsStats(weekAgoId);

    // Fetch global stats for today and 7 days ago
    const latestGlobalStats: GlobalStats = await this.jobStatsService.getGlobalStats(todayId);
    const weekAgoGlobalStats: GlobalStats = await this.jobStatsService.getGlobalStats(weekAgoId);

    // Calculate the changes over 7 days
    const totalStablecoinsMarketCap = latestStablecoinStats.totalMarketCapUSD;
    const changeInStablecoinsMarketCap = latestStablecoinStats.totalMarketCapUSD - weekAgoStablecoinStats.totalMarketCapUSD;
    const stablecoinsMarketCapShare = latestStablecoinStats.totalMarketCapUSD / latestGlobalStats.totalMarketCap;
    const weekAgoStablecoinsMarketCapShare = weekAgoStablecoinStats.totalMarketCapUSD / weekAgoGlobalStats.totalMarketCap;
    const changeInMarketCapShare = stablecoinsMarketCapShare - weekAgoStablecoinsMarketCapShare;

    const marketCapDirection = changeInStablecoinsMarketCap >= 0 ? '+' : '-';
    const marketCapShareDirection = changeInMarketCapShare >= 0 ? '+' : '-';

    const twitterClient = new TwitterApi({
      appKey: process.env.CHAINKRAFTCOM_APP_KEY,
      appSecret: process.env.CHAINKRAFTCOM_APP_SECRET,
      accessToken: process.env.CHAINKRAFTCOM_ACCESS_TOKEN,
      accessSecret: process.env.CHAINKRAFTCOM_ACCESS_SECRET,
    });

    // Prepare tweet content
    const tweet =
      `💰 Total market cap of stablecoins: ${shortCurrencyFormat(totalStablecoinsMarketCap)} (${marketCapDirection}${shortCurrencyFormat(
        Math.abs(changeInStablecoinsMarketCap),
      )} in 7 days)\n\n` +
      `📊 Stablecoins' share of the crypto market: ${percentageFormat(stablecoinsMarketCapShare, 100)} (${marketCapShareDirection}${percentageFormat(
        Math.abs(changeInMarketCapShare),
        100,
      )})\n\n` +
      `#crypto #stablecoins #DeFi`;

    console.log(tweet);
    // Create a chart for the tweet
    const chartBuffer = await createChart(
      `http://analytics.chainkraft.com/charts/stats`,
      { width: 1280, height: 720 },
      '#stablecoin-share-area-chart',
    );
    const watermarkedBuffer = await waterMark(chartBuffer);

    // Upload media and prepare tweet
    const mediaId = await twitterClient.v1.uploadMedia(watermarkedBuffer, { mimeType: EUploadMimeType.Png });
    const tweets = [];
    tweets.push({ text: tweet, media: { media_ids: [mediaId] } });

    // Post the tweet
    logger.info(await twitterClient.v2.tweetThread(tweets));

    // Save the tweet to the database
    await this.socialMediaPostService.saveSocialMediaPost({
      socialMedia: SocialMedia.TWITTER,
      account: 'chainkraftcom',
      text: tweet,
      // images: [{ data: watermarkedBuffer, contentType: EUploadMimeType.Png }],
    });
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
  }

  calculatePercentageChange(previousValue: number, currentValue: number): number {
    if (previousValue === 0) return 0; // Return 0 if previous value is 0 to avoid division by zero

    return ((currentValue - previousValue) / previousValue) * 100;
  }
}
