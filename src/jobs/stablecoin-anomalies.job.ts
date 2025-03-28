import NotificationService from '@services/notifications.service';
import { isEmpty } from '@/utils/util';
import TokenApiService from '@/services/token-apis.service';
import * as schedule from 'node-schedule';
import {
  Notification,
  NotificationSeverity,
  NotificationStablecoinDepegDataSchema,
  NotificationType,
  TokenDepeg,
} from '@interfaces/notifications.interface';
import moment from 'moment';
import TokenService from '@services/tokens.service';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';

export class StablecoinAnomaliesJob implements RecurringJob {
  private readonly job: schedule.Job;
  public tokenService = new TokenService();
  public notificationService = new NotificationService();
  public tokenApiService = new TokenApiService();

  constructor() {
    logger.info('Scheduling StablecoinAnomaliesJob');
    this.job = schedule.scheduleJob('0 */4 * * *', () => {
      logger.info('Executing StablecoinAnomaliesJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing StablecoinAnomaliesJob', e);
      });
    });
  }

  public async executeJob(): Promise<void> {
    const numberOfDays = 14;

    const latestNotifications: Notification[] = await this.notificationService.notifications.find({
      type: NotificationType.STABLECOIN_DEPEG,
      createdAt: {
        $gt: moment().subtract(48, 'hours').toDate(),
      },
    });

    const depeggedtokens = await this.getDepeggedTokens(numberOfDays);
    const newNotifications: Notification[] = this.genererateDepegNotifications(depeggedtokens, latestNotifications);

    newNotifications.forEach(notification => {
      this.notificationService.createNotification(notification);
    });
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
  }

  genererateDepegNotifications(depeggedTokens: TokenDepeg[], latestNotifications: Notification[]): Notification[] {
    const newNotifications: Notification[] = [];
    const excludedTokens = [''];

    // Filtering does produce new array!
    const filteredDepeggedTokens = depeggedTokens
      .filter(depeg => !excludedTokens.includes(depeg.token.symbol))
      .filter(depeg => {
        const prevNotification = latestNotifications.find(notification => notification.token._id.equals(depeg.token._id));
        if (!isEmpty(prevNotification)) {
          return prevNotification.data.price - depeg.price > 0.03;
        }
        return true;
      });

    logger.info('StablecoinAnomaliesJob anomalies found', filteredDepeggedTokens);

    if (filteredDepeggedTokens.length > 0) {
      filteredDepeggedTokens.forEach(depeg => {
        newNotifications.push({
          type: NotificationType.STABLECOIN_DEPEG,
          severity: NotificationSeverity.CRITICAL,
          token: depeg.token,
          data: <NotificationStablecoinDepegDataSchema>{
            price: depeg.price ?? latestNotifications.find(notification => notification.token._id.equals(depeg.token._id))?.data?.price,
            avgPrice: depeg.avgPrice,
            prices: depeg.prices,
            chains: depeg.chains,
          },
        });
      });
    }

    return newNotifications;
  }

  public async getDepeggedTokens(numberOfDays = 14, excludeTokens: string[] = []): Promise<TokenDepeg[]> {
    const stablecoins = await this.tokenService.findAllStablecoins();
    const llamaTokens = await this.tokenApiService.getStablecoinsFromDefiLlama();
    const llamaPrices = await this.tokenApiService.getStablecoinsPricesFromDefiLlama();
    llamaPrices.pop();

    const depeggedLlamaTokens = llamaTokens.filter(
      (token: any) => token.price && token.price < 1 && token.pegType.includes('peggedUSD') && !excludeTokens.includes(token.symbol),
    );

    const lastWeekPrices = [];
    for (let i = 0; i < numberOfDays; i++) {
      lastWeekPrices.push(llamaPrices.pop());
    }

    const averagePrices = new Map<string, number>();
    for (const day of lastWeekPrices) {
      for (const key in day.prices) {
        const dayPrice = day.prices[key];
        if (averagePrices.has(key)) {
          averagePrices.set(key, averagePrices.get(key) + dayPrice);
        } else {
          averagePrices.set(key, dayPrice);
        }
      }
    }

    for (const [key, value] of averagePrices) {
      averagePrices.set(key, value / numberOfDays);
    }

    const depegged: TokenDepeg[] = [];
    for (const llamaToken of depeggedLlamaTokens) {
      const averagePrice = averagePrices.get(llamaToken.gecko_id);
      const weeksPrices = [];
      for (const day of lastWeekPrices) {
        for (const key in day.prices) {
          if (key == llamaToken.gecko_id) {
            weeksPrices.push(day.prices[key]);
          }
        }
      }

      if (llamaToken.price - averagePrice < -0.02) {
        depegged.push({
          token: stablecoins.find(token => token.gecko_id == llamaToken.gecko_id),
          price: llamaToken.price,
          avgPrice: averagePrice,
          prices: weeksPrices,
          chains: llamaToken.chains,
        });
      }
    }

    return depegged;
  }

  // dirty code for manual generation
  tokenSlugs = ['usdh', 'tor', 'fei-usd', 'coin98-dollar', 'dforce-usd', 'iusd'];
  tokenGeckoIds = ['tor', 'coin98-dollar', 'token-dforce-usd', 'iusd'];

  public async getDepeggedTokensManually(numberOfDays = 14, excludeTokens: string[] = []): Promise<TokenDepeg[]> {
    const stablecoins = await this.tokenService.findAllStablecoins();
    const llamaTokens = await this.tokenApiService.getStablecoinsFromDefiLlama();
    const llamaPrices = await this.tokenApiService.getStablecoinsPricesFromDefiLlama();
    llamaPrices.pop();

    const depeggedLlamaTokens = llamaTokens.filter((token: any) => this.tokenGeckoIds.includes(token.gecko_id));

    const lastWeekPrices = [];
    for (let i = 0; i < numberOfDays; i++) {
      lastWeekPrices.push(llamaPrices.pop());
    }

    const averagePrices = new Map<string, number>();
    for (const day of lastWeekPrices) {
      for (const key in day.prices) {
        const dayPrice = day.prices[key];
        if (averagePrices.has(key)) {
          averagePrices.set(key, averagePrices.get(key) + dayPrice);
        } else {
          averagePrices.set(key, dayPrice);
        }
      }
    }

    for (const [key, value] of averagePrices) {
      averagePrices.set(key, value / numberOfDays);
    }

    const depegged: TokenDepeg[] = [];
    for (const llamaToken of depeggedLlamaTokens) {
      const averagePrice = averagePrices.get(llamaToken.gecko_id);
      const weeksPrices = [];
      for (const day of lastWeekPrices) {
        for (const key in day.prices) {
          if (key == llamaToken.gecko_id) {
            weeksPrices.push(day.prices[key]);
          }
        }
      }

      depegged.push({
        token: stablecoins.find(token => token.gecko_id == llamaToken.gecko_id),
        price: llamaToken.price,
        avgPrice: averagePrice,
        prices: weeksPrices,
        chains: llamaToken.chains,
      });
    }

    return depegged;
  }
}
