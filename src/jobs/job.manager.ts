import { RecurringJob } from './recurring.job';
import { RefreshStablecoinPricesJob } from './refresh-stablecoin-prices.job';
import { RefreshScoreJob } from './score-calculation.job';
import { StablecoinContractsImport } from '@/jobs/stablecoin-contracts.job';
import { CurvePoolsJob } from './curve-pools.job';
import { StablecoinAnomaliesJob } from './stablecoin-anomalies.job';
import { ProtocolsImport } from '@/jobs/protocols.job';
import { StablecoinTwitterJob } from '@/jobs/stablecoin-twitter.job';
import { ContractAnomaliesJob } from '@/jobs/contract-anomalies.job';
import { UniswapPoolsJob } from './uniswap-pools.job';
import { PoolsCompositionNotificationsJob } from './pools-composition.job';

export class JobManager {
  jobs: RecurringJob[] = [];

  constructor() {
    this.addJob(new RefreshStablecoinPricesJob());
    this.addJob(new RefreshScoreJob());
    this.addJob(new CurvePoolsJob());
    this.addJob(new UniswapPoolsJob());
    this.addJob(new PoolsCompositionNotificationsJob());
    this.addJob(new ContractAnomaliesJob());
    this.addJob(new StablecoinAnomaliesJob());
    this.addJob(new StablecoinTwitterJob());
    this.addJob(new StablecoinContractsImport());
    this.addJob(new ProtocolsImport());
  }

  addJob(...jobs: RecurringJob[]): boolean {
    jobs.forEach(c => this.jobs.push(c));
    return true;
  }

  scheduleJobs() {
    if (this.jobs.length > 0) {
      this.jobs.forEach(job => {
        job.doIt();
      });
    }
  }
}
