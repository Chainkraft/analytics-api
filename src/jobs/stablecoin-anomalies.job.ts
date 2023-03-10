import { RecurringJob } from './recurring.job';
import tokenService from '@services/tokens.service';
import NotificationService from '@services/notifications.service';
import { isEmpty } from '@/utils/util';
import TokenApiService from '@/services/token-apis.service';
import { Token } from '@interfaces/tokens.inteface';
import * as schedule from 'node-schedule';
import { Notification, NotificationSeverity, NotificationStablecoinDepegDataSchema, NotificationType } from '@interfaces/notifications.interface';

export class StablecoinAnomaliesJob implements RecurringJob {
  public tokenService = new tokenService();
  public notificationService = new NotificationService();
  public tokenApiService = new TokenApiService();

  doIt(): any {
    console.log('Scheduling StablecoinAnomaliesJob');
    schedule.scheduleJob('0 */4 * * *', () => this.generateNotifications());
  }

  async generateNotifications() {
    const excludedTokens = [''];
    const numberOfDays = 14;

    const latestNotifications: Notification[] = await this.notificationService.notifications.find({
      type: NotificationType.STABLECOIN_DEPEG,
      createdAt: {
        $gt: new Date(Date.now() - 86_400_000),
      },
    });
    const depegTokens = (await this.getStablecoinsForPriceAlert(numberOfDays))
      .filter(depeg => !excludedTokens.includes(depeg.token.symbol))
      .filter(depeg => {
        const prevNotification = latestNotifications.find(notification => notification.token._id === depeg.token._id);
        if (!isEmpty(prevNotification)) {
          return prevNotification.data.price - depeg.price > 0.03;
        }
        return true;
      });

    console.log('StablecoinAnomaliesJob anomalies found', depegTokens);

    if (depegTokens.length > 0) {
      depegTokens.forEach(depeg => {
        this.notificationService.createNotification({
          type: NotificationType.STABLECOIN_DEPEG,
          severity: NotificationSeverity.CRITICAL,
          token: depeg.token,
          data: <NotificationStablecoinDepegDataSchema>{
            price:
              depegTokens.find(tweetedToken => tweetedToken.token._id === depeg.token._id)?.price ??
              latestNotifications.find(notification => notification.token._id === depeg.token._id)?.data?.price ??
              depeg.price,
            avgPrice: depeg.avgPrice,
            prices: depeg.prices,
            chains: depeg.chains,
          },
        });
      });
    }
  }

  public async getStablecoinsForPriceAlert(numberOfDays = 14, excludeTokens: string[] = []): Promise<TokenDepeg[]> {
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
}

interface TokenDepeg extends NotificationStablecoinDepegDataSchema {
  token: Token;
}
