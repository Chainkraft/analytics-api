import { PriceHistory, Token } from '@/interfaces/tokens.inteface';
import priceHistoryModel from '@/models/prices-history.model';
import { isEmpty } from '@/utils/util';
import tokenModel from '@/models/tokens.model';
import scoreModel from '@/models/scores.model';
import TokensScoreService from '@/services/tokens-scores.service';
import TokenService from '@/services/tokens.service';
import TokensPriceService from '@/services/tokens-prices.service';
import { Score } from '@/interfaces/scores.interface';
import * as schedule from 'node-schedule';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';

export class RefreshScoreJob implements RecurringJob {
  private readonly job: schedule.Job;
  public scoreService = new TokensScoreService();
  public tokenService = new TokenService();
  public pricesService = new TokensPriceService();
  public priceHistory = priceHistoryModel;
  public tokens = tokenModel;
  public score = scoreModel;

  constructor() {
    logger.info('Scheduling RefreshScoreJob');
    this.job = schedule.scheduleJob({ hour: 0, minute: 10, tz: 'Etc/UTC' }, () => {
      logger.info('Executing RefreshScoreJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing RefreshScoreJob', e);
      });
    });
  }

  public async executeJob(): Promise<void> {
    const latestScore = await this.scoreService.findLatestScore();

    if (!isEmpty(latestScore)) {
      // if last score's date is today, don't refresh
      if (latestScore.createdAt.toDateString() === new Date().toDateString()) {
        return;
      }
    }
    const tokens: Token[] = await this.tokenService.findAllToken();
    const priceHistories: PriceHistory[] = await this.pricesService.findAllPriceHistories();

    await this.score.create(this.calculateNewScores(tokens, priceHistories));
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
  }

  calculateStandardDeviationBelowPeg(arr: number[]): number {
    const mean = 1;
    const normalizedArray = arr.map(val => (val > mean ? mean : val));
    const usePopulation = false;
    const deviation = Math.sqrt(
      normalizedArray.reduce((acc, val) => acc.concat((val - mean) ** 2), [] as number[]).reduce((acc, val) => acc + val, 0) /
        (normalizedArray.length - (usePopulation ? 0 : 1)),
    );
    return deviation;
  }

  calculateNewScores(tokens: Token[], priceHistories: PriceHistory[]): Score {
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
          .slice(0, 60);

        return this.calculateStandardDeviationBelowPeg(sortedPrices);
      })
      .filter(value => !Number.isNaN(value))
      .sort((a, b) => a - b);

    logger.info('Stablecoins score has been refreshed.');

    return {
      chains: chains,
      volumes: volumes,
      marketCaps: marketCaps,
      priceDeviations: priceDeviations,
    };
  }
}
