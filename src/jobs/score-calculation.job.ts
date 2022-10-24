import { RecurringJob } from './recurring.job';
import { PriceHistory, Token } from '@/interfaces/tokens.inteface';
import priceHistoryModel from '@/models/prices-history.model';
import { isEmpty } from '@/utils/util';
import tokenModel from '@/models/tokens.model';
import scoreModel from '@/models/scores.model';
import ScoreService from '@/services/scores.service';
import TokenService from '@/services/tokens.service';
import PriceService from '@/services/prices.service';

export class RefreshScoreJob implements RecurringJob {
  public scoreService = new ScoreService();
  public tokenService = new TokenService();
  public pricesService = new PriceService();
  public priceHistory = priceHistoryModel;
  public tokens = tokenModel;
  public score = scoreModel;

  async doIt(): Promise<any> {
    const latestScore = await this.scoreService.findLatestScore();

    if (!isEmpty(latestScore)) {
      // if last score's date is today, don't refresh
      if (latestScore.createdAt.toDateString() === new Date().toDateString()) {
        return;
      }
    }

    const tokens: Token[] = await this.tokenService.findAllToken();
    const priceHistories: PriceHistory[] = await this.pricesService.findAllPriceHistories();

    const chains: number[] = tokens
      .filter(token => !isEmpty(token.chains))
      .map(token => {
        return token.chains.length;
      })
      .sort((a, b) => a - b);

    const marketCaps: number[] = tokens
      .filter(token => !isEmpty(token.current_market_cap))
      .map(token => {
        return token.current_market_cap;
      })
      .sort((a, b) => a - b);

    const volumes: number[] = tokens
      .filter(token => !isEmpty(token.volume_24h))
      .map(token => {
        return token.volume_24h;
      })
      .sort((a, b) => a - b);

    const priceDeviations: number[] = priceHistories
      .filter(priceHistory => !isEmpty(priceHistory))
      .map(priceHistory => {
        const sortedPrices = priceHistory.prices
          .sort((objA, objB) => objB.date.getTime() - objA.date.getTime())
          .map(value => value.price)
          .slice(0, 30);
        const meanValue = 1;
        const usePopulation = false;

        const standardDeviation = Math.sqrt(
          sortedPrices.reduce((acc, val) => acc.concat((val - meanValue) ** 2), []).reduce((acc, val) => acc + val, 0) /
            (sortedPrices.length - (usePopulation ? 0 : 1)),
        );

        return standardDeviation;
      })
      .sort((a, b) => a - b);

    return this.score.create({
      chains: chains,
      volumes: volumes,
      marketCaps: marketCaps,
      priceDeviations: priceDeviations,
    });
  }
}
