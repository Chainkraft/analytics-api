import JobStatsService from '@services/job-stats.service';
import { GlobalStats, LlamaStablecoinsResponse, StablecoinsStats } from '@interfaces/jobs-stats.interface';
import moment from 'moment';
import * as schedule from 'node-schedule';
import { percentageFormat, shortCurrencyFormat } from '@utils/helpers';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';
import { TwitterApi } from 'twitter-api-v2';

export class StablecoinsStatsTwitterJob implements RecurringJob {
  private readonly job: schedule.Job;
  private jobStatsService = new JobStatsService();

  constructor() {
    logger.info('Scheduling StablecoinsStatsTwitterJob');
    this.job = schedule.scheduleJob({ hour: 19, minute: 10, tz: 'UTC' }, () => {
      logger.info('Executing StablecoinsStatsTwitterJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing StablecoinsStatsTwitterJob', e);
      });
    });
  }

  public async executeJob(): Promise<void> {
    // refresh data
    await this.collectData();

    // fetch stablecoins stats
    const stablecoinStats: StablecoinsStats[] = await this.jobStatsService.getAllStablecoinsStats();
    const latestStablecoinStats = stablecoinStats[stablecoinStats.length - 1];
    const prevDayStablecoinStats = stablecoinStats[stablecoinStats.length - 2];

    // fetch global stats
    const today = moment().format('YYYY-MM-DD');

    const prevId = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const latestGlobalStats: GlobalStats = await this.jobStatsService.getGlobalStats(today);
    const prevDayGlobalStats: GlobalStats = await this.jobStatsService.getGlobalStats(prevId);

    if (latestStablecoinStats._id !== today) {
      logger.error('Latest stablecoin stats is not from today: ', latestStablecoinStats);
      return;
    }

    const totalStablecoinsMarketCap = latestStablecoinStats.totalMarketCapUSD;
    const changeInStablecoinsMarketCap = latestStablecoinStats.totalMarketCapUSD - prevDayStablecoinStats.totalMarketCapUSD;
    const stablecoinsMarketCapShare = latestStablecoinStats.totalMarketCapUSD / latestGlobalStats.totalMarketCap;

    const marketCapDirection = changeInStablecoinsMarketCap >= 0 ? `⬆️` : `🔻`;

    // Your tweet
    const tweet =
      `💰 Total stablecoins market cap: ${shortCurrencyFormat(totalStablecoinsMarketCap)} (${marketCapDirection} ${shortCurrencyFormat(
        Math.abs(changeInStablecoinsMarketCap),
      )})\n` +
      `📊 Stablecoins' share of crypto market: ${percentageFormat(stablecoinsMarketCapShare, 100)}\n\n` +
      `#crypto #stablecoins #DeFi`;

    const twitterClient = new TwitterApi({
      appKey: process.env.STABLEALERTS_APP_KEY,
      appSecret: process.env.STABLEALERTS_APP_SECRET,
      accessToken: process.env.STABLEALERTS_ACCESS_TOKEN,
      accessSecret: process.env.STABLEALERTS_ACCESS_SECRET,
    });

    const tweets = [];
    tweets.push({ text: tweet });
    logger.info(await twitterClient.v2.tweetThread(tweets));
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
  }

  async collectData() {
    const apiStablecoinsStats: LlamaStablecoinsResponse[] = await this.jobStatsService.getStablecoinsStatsFromLlama();

    const formattedStats = apiStablecoinsStats.map(entry => {
      const date = moment.unix(parseInt(entry.date));
      const formattedDate = date.format('YYYY-MM-DD');
      const marketCapSum = Object.values(entry.totalCirculatingUSD).reduce((acc, val) => acc + val, 0);

      return {
        date: formattedDate,
        year: date.year(),
        month: date.month() + 1,
        day: date.date(),
        totalMarketCapUSD: marketCapSum,
      };
    });

    // Retrieve all StablecoinsStats records from the database and sort by _id
    const savedStablecoinStats = await this.jobStatsService.getAllStablecoinsStats();

    // Find the latest saved date, assuming _id is 'YYYY-MM-DD' format
    const latestSavedDate = savedStablecoinStats.length > 0 ? savedStablecoinStats[savedStablecoinStats.length - 1]._id : null;

    if (latestSavedDate) {
      const latestSavedIndex = formattedStats.findIndex(entry => entry.date === latestSavedDate);

      if (latestSavedIndex !== -1 && latestSavedIndex !== formattedStats.length - 1) {
        const entriesToSave = formattedStats.slice(latestSavedIndex + 1); // Save the new entries after the latest saved date
        console.log('Entries to save:', entriesToSave);

        await Promise.all(
          entriesToSave.map(async entry => {
            this.jobStatsService.saveStablecoinsStats({
              _id: entry.date,
              year: entry.year,
              month: entry.month,
              day: entry.day,
              totalMarketCapUSD: entry.totalMarketCapUSD,
            });
          }),
        );
      } else {
        console.log('No new entries to save.');
      }
    } else {
      console.log('No existing records found. Save all entries.');
      // Save all entries to the database
      await Promise.all(
        formattedStats.map(async entry => {
          this.jobStatsService.saveStablecoinsStats({
            _id: entry.date,
            year: entry.year,
            month: entry.month,
            day: entry.day,
            totalMarketCapUSD: entry.totalMarketCapUSD,
          });
        }),
      );
    }
  }

  calculatePercentageChange(previousValue: number, currentValue: number): number {
    if (previousValue === 0) return 0; // Return 0 if previous value is 0 to avoid division by zero

    return ((currentValue - previousValue) / previousValue) * 100;
  }
}
