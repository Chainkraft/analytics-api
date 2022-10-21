import { RecurringJob } from './recurring.job';
import { RefreshStablecoinPricesJob } from './refresh-stablecoin-prices.job';
import { RefreshScoreJob } from './score-calculation.job';

export class JobManager {
  jobs: RecurringJob[] = [];

  constructor() {
    this.addJob(new RefreshStablecoinPricesJob());
    this.addJob(new RefreshScoreJob());
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
