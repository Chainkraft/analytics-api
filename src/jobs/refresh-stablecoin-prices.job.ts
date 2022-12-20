import { RecurringJob } from './recurring.job';
import TokenService from '@services/tokens.service';
import TokenApiService from '@/services/token-apis.service';
import { PriceHistory } from '@/interfaces/tokens.inteface';
import priceHistoryModel from '@/models/prices-history.model';
import { isEmpty } from '@/utils/util';
import * as schedule from 'node-schedule';

export class RefreshStablecoinPricesJob implements RecurringJob {
  public tokenService = new TokenService();
  public tokenApiService = new TokenApiService();
  public priceHistory = priceHistoryModel;

  doIt(): any {
    console.log('Scheduling RefreshStablecoinPricesJob');
    schedule.scheduleJob({ hour: 1, minute: 0 }, () => this.refreshStablecoinPrices());
  }

  async refreshStablecoinPrices(): Promise<PriceHistory[]> {
    const usdcPriceHistory = await this.priceHistory.findOne({ slug: 'usd-coin' });

    if (!isEmpty(usdcPriceHistory) && Array.isArray(usdcPriceHistory.prices)) {
      const lastPriceDate = usdcPriceHistory.prices.pop().date;

      // if last price's date is today, don't refresh
      if (lastPriceDate.toDateString() === new Date().toDateString()) {
        return;
      }
    }

    const llamaPrices = await this.tokenApiService.getStablecoinsPricesFromDefiLlama();
    const tokenPricesMap = new Map<string, [{ price: number; date: Date }]>();

    llamaPrices.forEach(row => {
      Object.keys(row.prices).forEach(key => {
        if (tokenPricesMap.has(key)) {
          tokenPricesMap.get(key).push({ date: new Date(row.date * 1000), price: row.prices[key] });
        } else {
          tokenPricesMap.set(key, [{ date: new Date(row.date * 1000), price: row.prices[key] }]);
        }
      });
    });

    const tokens = await this.tokenService.findAllStablecoins();
    const freshTokensPrices: PriceHistory[] = [];

    for (const [gecko_id, prices] of tokenPricesMap) {
      const found = tokens.find(element => element.gecko_id === gecko_id);
      if (found) {
        freshTokensPrices.push({
          gecko_id: gecko_id,
          slug: found.slug,
          token: found.symbol,
          prices: prices,
        });
      }
    }

    console.log('Refreshed stablecoin prices.');

    return Promise.all(
      freshTokensPrices.map(async (priceHistory: PriceHistory) => {
        return this.priceHistory.findOneAndUpdate({ gecko_id: priceHistory.gecko_id }, priceHistory, {
          new: true,
          upsert: true,
        });
      }),
    );
  }
}
