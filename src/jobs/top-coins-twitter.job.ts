import { CoinGeckoClient } from 'coingecko-api-v3';
import { CoinMarket } from 'coingecko-api-v3/dist/Interface';
import { COINGECKO_DEMO_API_KEY, CRYPTOSTATS_ACCESS_SECRET, CRYPTOSTATS_ACCESS_TOKEN, CRYPTOSTATS_APP_KEY, CRYPTOSTATS_APP_SECRET } from '@config';
import { currencyFormat } from '@utils/helpers';
import * as schedule from 'node-schedule';
import { RecurringJob } from '@/jobs/job.manager';
import { TwitterApi } from 'twitter-api-v2';
import { logger } from '@/config/logger';

export class TopCoinsTwitterJob implements RecurringJob {
  private readonly job: schedule.Job;
  private readonly coingecko = new CoinGeckoClient({
    timeout: 60000,
    autoRetry: true,
  });

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
  }

  private getCoinStatsRow(coin: CoinMarket, position: number): string {
    const price = coin.current_price < 0.01 ? coin.current_price : currencyFormat(coin.current_price.toString(), 2);
    let change = coin.price_change_percentage_24h > 0 ? `⬆️` : `🔻`;
    change += coin.price_change_percentage_24h.toFixed(Math.abs(coin.price_change_percentage_24h) < 1 ? 2 : 0);

    return `${position}. $${coin.symbol.toUpperCase()} ${change}%\n`;
  }

  private async getCoinList(): Promise<CoinMarket[]> {
    const coins: CoinMarket[] = [];
    const PER_PAGE = 250;
    const MAX_PAGES = 4;

    for (let i = 1; i <= MAX_PAGES; i++) {
      const pageCoins = await this.coingecko.coinMarket({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: PER_PAGE,
        page: i,
        sparkline: false,
        // @ts-ignore - biblioteka nie pozwala na dodanie demo key
        x_cg_demo_api_key: COINGECKO_DEMO_API_KEY,
      });

      if (pageCoins && pageCoins.length > 0) {
        coins.push(...pageCoins);
      } else {
        break;
      }
    }

    return coins;
  }

  private getTopCoins(coins: CoinMarket[], fromIndex: number, toIndex: number, limit = 5): CoinMarket[] {
    const sortByPriceChange = (a: CoinMarket, b: CoinMarket) => b.price_change_percentage_24h - a.price_change_percentage_24h;
    coins = coins.slice(fromIndex, toIndex).sort(sortByPriceChange);
    return limit > 0 ? coins.slice(0, limit) : coins.slice(limit);
  }
}
