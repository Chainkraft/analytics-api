import { RecurringJob } from './recurring.job';
import { RefreshStablecoinPricesJob } from './refresh-stablecoin-prices.job';
import { RefreshScoreJob } from './score-calculation.job';
import { ContractImport } from '@/jobs/contracts-import.job';
import { TestJob } from './test.job';
import { CurvePoolsJob } from './curve-pools.job';

export class JobManager {
  jobs: RecurringJob[] = [];

  constructor() {
    this.addJob(new TestJob());

    this.addJob(new ContractImport());
    this.addJob(new RefreshStablecoinPricesJob());
    this.addJob(new RefreshScoreJob());
    this.addJob(new CurvePoolsJob());
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
