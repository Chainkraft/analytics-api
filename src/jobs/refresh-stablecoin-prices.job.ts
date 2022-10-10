import { RecurringJob } from './recurring.job';
import TokenService from '@services/tokens.service';
import TokenApiService from '@/services/token-apis.service';
import { PriceHistory } from '@/interfaces/tokens.inteface';
import priceHistoryModel from '@/models/prices-history.model';
import { isEmpty } from '@/utils/util';

export class RefreshStablecoinPricesJob implements RecurringJob {
  public tokenService = new TokenService();
  public tokenApiService = new TokenApiService();
  public priceHistory = priceHistoryModel;

  async doIt(): Promise<PriceHistory[]> {
    const usdcPriceHistory = await this.priceHistory.findOne({ token: 'USDC' });

    if (!isEmpty(usdcPriceHistory)) {
      const lastPriceDate = usdcPriceHistory.prices.at(-1).date;

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
          token: found.symbol,
          prices: prices,
        });
      }
    }

    return Promise.all(
      freshTokensPrices.map(async (priceHistory: PriceHistory) => {
        return this.priceHistory.findOneAndUpdate({ token: priceHistory.token }, priceHistory, {
          new: true,
          upsert: true,
        });
      }),
    );
  }
}
