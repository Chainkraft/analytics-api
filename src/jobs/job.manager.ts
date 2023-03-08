import { RecurringJob } from './recurring.job';
import { RefreshStablecoinPricesJob } from './refresh-stablecoin-prices.job';
import { RefreshScoreJob } from './score-calculation.job';
import { StablecoinContractsImport } from '@/jobs/stablecoin-contracts.job';
import { TestJob } from './test.job';
import { CurvePoolsJob } from './curve-pools.job';
import { StablecoinAnomaliesJob } from './stablecoin-anomalies.job';
import { DefiContractsImport } from '@/jobs/defi-contracts.job';
import { StablecoinTwitterJob } from "@/jobs/stablecoin-twitter.job";
import { ContractAnomaliesJob } from "@/jobs/contract-anomalies.job";

export class JobManager {
  jobs: RecurringJob[] = [];

  constructor() {
    this.addJob(new TestJob());

    this.addJob(new RefreshStablecoinPricesJob());
    this.addJob(new RefreshScoreJob());
    this.addJob(new CurvePoolsJob());
    this.addJob(new ContractAnomaliesJob());
    this.addJob(new StablecoinAnomaliesJob());
    this.addJob(new StablecoinTwitterJob());
    this.addJob(new StablecoinContractsImport());
    this.addJob(new DefiContractsImport());
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
