import { TopCoinsTwitterJob } from '@/jobs/top-coins-twitter.job';
import { GlobalStatsTwitterJob } from '@/jobs/global-stats-twitter.job';
import { RefreshStablecoinPricesJob } from './refresh-stablecoin-prices.job';
import { RefreshScoreJob } from '@/jobs/score-calculation.job';
import { CurvePoolsJob } from '@/jobs/curve-pools.job';
import { UniswapPoolsJob } from '@/jobs/uniswap-pools.job';
import { PoolsCompositionNotificationsJob } from '@/jobs/pools-composition.job';
import { ContractAnomaliesJob } from '@/jobs/contract-anomalies.job';
import { StablecoinAnomaliesJob } from '@/jobs/stablecoin-anomalies.job';
import { StablecoinTwitterJob } from '@/jobs/stablecoin-twitter.job';
import { StablecoinContractsImport } from '@/jobs/stablecoin-contracts.job';
import { PoolsCompositionTwitterJob } from './pools-composition.twitter.job';
import { StablecoinsStatsTwitterJob } from './stablecoins-stats.twitter.job';
import { StablecoinsWeeklyStatsTwitterJob } from './stablecoins-weekly-stats.twitter.job';

export class JobManager {
  private jobs: Job[] = [];

  constructor() {
    this.addJob(new ContractAnomaliesJob());
    this.addJob(new CurvePoolsJob());
    this.addJob(new UniswapPoolsJob());
    this.addJob(new PoolsCompositionNotificationsJob());
    this.addJob(new RefreshScoreJob());
    this.addJob(new RefreshStablecoinPricesJob());
    this.addJob(new StablecoinAnomaliesJob());
    this.addJob(new StablecoinContractsImport());

    if (process.env.NODE_ENV === 'production') {
      // social posts
      this.addJob(new StablecoinsStatsTwitterJob());
      this.addJob(new GlobalStatsTwitterJob());
      // this.addJob(new PoolsCompositionTwitterJob());
      this.addJob(new StablecoinTwitterJob());
      this.addJob(new TopCoinsTwitterJob());
      this.addJob(new StablecoinsWeeklyStatsTwitterJob());
    }
  }

  public addJob(...jobs: Job[]): boolean {
    jobs.forEach(c => this.jobs.push(c));
    return true;
  }

  public getJob(className: string): Job | undefined {
    return this.jobs.find(obj => obj.constructor.name === className);
  }
}

export interface RecurringJob extends Job {
  cancelJob(): void;
}

export interface Job {
  executeJob(): Promise<void>;
}
