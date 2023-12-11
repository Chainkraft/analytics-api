import { CRYPTOSTATS_ACCESS_SECRET, CRYPTOSTATS_ACCESS_TOKEN, CRYPTOSTATS_APP_KEY, CRYPTOSTATS_APP_SECRET } from '@config';
import * as schedule from 'node-schedule';
import { RecurringJob } from '@/jobs/job.manager';
import { TwitterApi } from 'twitter-api-v2';
import { logger } from '@/config/logger';
import TokenApisService from '@services/token-apis.service';
import SocialMediaPostService from '@services/social-media-post.service';
import { SocialMedia } from '@interfaces/socia-media-post.interface';

export class TopCoinsTwitterJob implements RecurringJob {
  private readonly job: schedule.Job;
  private apiService = new TokenApisService();
  private socialMediaPostService = new SocialMediaPostService();

  constructor() {
    logger.info('Scheduling TopCoinsTwitterJob');
    this.job = schedule.scheduleJob({ hour: 16, minute: 0, tz: 'UTC' }, () => {
      logger.info('Executing TopCoinsTwitterJob');
      this.executeJob().catch(e => {
        logger.error(e);
      });
    });
  }

  public cancelJob() {
    if (this.job) {
      this.job.cancel();
    }
  }

  public async executeJob() {
    const coins = await this.getCoinList();

    // Top 250
    let topCoins = this.getTopCoins(coins, 0, 250, 5);
    let bottomCoins = this.getTopCoins(coins, 0, 250, -5);

    let bigCapTweet = `Today's #crypto highlights\n\n🏆 Top 250 large cap winners\n`;
    for (let i = 0; i < topCoins.length; i++) {
      bigCapTweet += this.getCoinStatsRow(topCoins[i], i + 1);
    }

    bigCapTweet += `\n💔 Top 250 large cap losers\n`;
    for (let i = 0; i < bottomCoins.length; i++) {
      bigCapTweet += this.getCoinStatsRow(bottomCoins[i], i + 1);
    }

    bigCapTweet += `\nExtra insights 👇`;

    // Top 1000
    topCoins = this.getTopCoins(coins, 250, 999, 5);
    bottomCoins = this.getTopCoins(coins, 250, 999, -5);

    let smallCapTweet = `🏆 Top 250-1000 small cap winners\n`;
    for (let i = 0; i < topCoins.length; i++) {
      smallCapTweet += this.getCoinStatsRow(topCoins[i], i + 1);
    }

    smallCapTweet += `\n💔 Top 250-1000 small cap losers\n`;
    for (let i = 0; i < bottomCoins.length; i++) {
      smallCapTweet += this.getCoinStatsRow(bottomCoins[i], i + 1);
    }

    const twitter = new TwitterApi({
      appKey: CRYPTOSTATS_APP_KEY,
      appSecret: CRYPTOSTATS_APP_SECRET,
      accessToken: CRYPTOSTATS_ACCESS_TOKEN,
      accessSecret: CRYPTOSTATS_ACCESS_SECRET,
    });
    const result = await twitter.v2.tweetThread([{ text: bigCapTweet }, { text: smallCapTweet }]);
    logger.info(result.map(tweet => tweet.data.text).join('\n'));

    await this.socialMediaPostService.saveSocialMediaPost({
      socialMedia: SocialMedia.TWITTER,
      account: 'GazillionCap',
      text: bigCapTweet + '\n\n' + smallCapTweet,
    });
  }

  private getCoinStatsRow(coin: any, position: number): string {
    let change = coin.quote.USD.percent_change_24h > 0 ? `⬆️` : `🔻`;
    change += coin.quote.USD.percent_change_24h.toFixed(Math.abs(coin.quote.USD.percent_change_24h) < 1 ? 2 : 0);

    return `${position}. $${coin.symbol.toUpperCase()} ${change}%\n`;
  }

  private async getCoinList(): Promise<any[]> {
    const pageCoins = await this.apiService.getCoinMarket({
      start: 1,
      limit: 1000,
    });
    return pageCoins.data.data;
  }

  private getTopCoins(coins: any[], fromIndex: number, toIndex: number, limit = 5): any[] {
    const sortByPriceChange = (a: any, b: any) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h;
    coins = coins.slice(fromIndex, toIndex).sort(sortByPriceChange);
    return limit > 0 ? coins.slice(0, limit) : coins.slice(limit).sort((a: any, b: any) => sortByPriceChange(b, a));
  }
}
