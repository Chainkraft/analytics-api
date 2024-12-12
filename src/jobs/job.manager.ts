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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class JobManager {
  private jobs: Job[] = [];

  constructor() {
    this.addJob(new ContractAnomaliesJob());
    this.addJob(new CurvePoolsJob());
    // this.addJob(new UniswapPoolsJob());
    this.addJob(new PoolsCompositionNotificationsJob());
    this.addJob(new RefreshScoreJob());
    this.addJob(new RefreshStablecoinPricesJob());
    this.addJob(new StablecoinAnomaliesJob());
    this.addJob(new StablecoinContractsImport());

    if (process.env.NODE_ENV === 'production') {
      // // social posts
      // this.addJob(new StablecoinsStatsTwitterJob());
      // this.addJob(new GlobalStatsTwitterJob());
      // // this.addJob(new PoolsCompositionTwitterJob());
      // this.addJob(new StablecoinTwitterJob());
      // this.addJob(new TopCoinsTwitterJob());
      // this.addJob(new StablecoinsWeeklyStatsTwitterJob());
    }
  }

  public addJob(...jobs: Job[]): boolean {
    jobs.forEach(c => this.jobs.push(c));
    return true;
  }

  public getJob(className: string): Job | undefined {
    return this.jobs.find(obj => obj.constructor.name === className);
  }

  public async executeJobsSequentially() {
    for (const job of this.jobs) {
      try {
        console.log(`Starting job: ${job.constructor.name} at ${new Date().toISOString()}`);
        await job.executeJob();
        console.log(`Completed job: ${job.constructor.name} at ${new Date().toISOString()}`);

        // Wait for 1 minute between jobs
        console.log('Waiting for 1 minute...');
        await delay(60000); // 60000 ms = 1 minute
      } catch (error) {
        console.error(`Error in job ${job.constructor.name}:`, error);

        // Still wait for 1 minute even if job fails
        console.log('Waiting for 1 minute after job failure...');
        await delay(60000);
      }
    }
  }
}

export interface RecurringJob extends Job {
  cancelJob(): void;
}

export interface Job {
  executeJob(): Promise<any>;
}
