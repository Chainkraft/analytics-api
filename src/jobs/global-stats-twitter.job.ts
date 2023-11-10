import { CoinGeckoClient, GlobalResponse } from 'coingecko-api-v3';
import JobStatsService from '@services/job-stats.service';
import { GlobalStats } from '@interfaces/jobs-stats.interface';
import moment from 'moment';
import * as schedule from 'node-schedule';
import { shortCurrencyFormat } from '@utils/helpers';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';
import { TwitterApi } from 'twitter-api-v2';
import { CRYPTOSTATS_ACCESS_SECRET, CRYPTOSTATS_ACCESS_TOKEN, CRYPTOSTATS_APP_KEY, CRYPTOSTATS_APP_SECRET } from '@config';

export class GlobalStatsTwitterJob implements RecurringJob {
  private readonly job: schedule.Job;
  private jobStatsService = new JobStatsService();
  private coingecko = new CoinGeckoClient({
    timeout: 10000,
    autoRetry: true,
  });

  constructor() {
    logger.info('Scheduling GlobalStatsTwitterJob');
    this.job = schedule.scheduleJob({ hour: 20, minute: 0, tz: 'UTC' }, () => {
      logger.info('Executing GlobalStatsTwitterJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing GlobalStatsTwitterJob', e);
      });
    });
  }

  public async executeJob(): Promise<void> {
    const todayStats = await this.collectData();
    const prevId = moment(todayStats._id, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');
    let prevStats = await this.jobStatsService.getGlobalStats(prevId);
    if (!prevStats) {
      prevStats = todayStats;
    }

    const tweet =
      "🌍 Today's #crypto market summary\n" +
      '\n' +
      `✅ Market cap: ${this.getValueWithChange(todayStats.totalMarketCap, prevStats.totalMarketCap)}\n` +
      `✅ 24h volume: ${this.getValueWithChange(todayStats.totalVolume, prevStats.totalVolume)}\n` +
      `✅ $BTC dominance: ${this.getValueWithChange(
        Number(todayStats.marketCapPercentage.get('btc')),
        Number(prevStats.marketCapPercentage.get('btc')),
        '%',
      )}\n` +
      '\n' +
      '#bitcoin #ethereum';

    const twitter = new TwitterApi({
      appKey: CRYPTOSTATS_APP_KEY,
      appSecret: CRYPTOSTATS_APP_SECRET,
      accessToken: CRYPTOSTATS_ACCESS_TOKEN,
      accessSecret: CRYPTOSTATS_ACCESS_SECRET,
    });
    const result = await twitter.v2.tweetThread([{ text: tweet }]);
    logger.info(result.map(tweet => tweet.data.text).join('\n'));
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
  }

  private getValueWithChange(newValue: number, oldValue: number, format: '%' | '$' = '$'): string {
    const value = format === '$' ? shortCurrencyFormat(newValue) : `${newValue.toFixed(2)}%`;
    const direction = newValue >= oldValue ? `⬆️` : `🔻`;
    const percentChange = Math.round(((newValue - oldValue) / Math.abs(oldValue)) * 100);
    return `${value} (${direction} ${percentChange}%)`;
  }

  private async collectData(): Promise<GlobalStats> {
    const globalData: GlobalResponse = await this.coingecko.global();
    const date = moment.unix(globalData.data.updated_at);
    return await this.jobStatsService.saveGlobalStats({
      _id: date.format('YYYY-MM-DD'),
      year: date.year(),
      month: date.month() + 1,
      day: date.date(),
      activeCryptocurrencies: globalData.data.active_cryptocurrencies,
      totalMarketCap: globalData.data.total_market_cap.usd,
      totalVolume: globalData.data.total_volume.usd,
      marketCapPercentage: new Map<string, number>(Object.entries(globalData.data.market_cap_percentage)),
      marketCapPercentageChange24h: globalData.data.market_cap_change_percentage_24h_usd,
    });
  }
}
