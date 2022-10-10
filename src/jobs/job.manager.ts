import { StablecoinAnomaliesJob } from './stablecoin-anomalies.job';
import { RecurringJob } from './recurring.job';
import { RefreshStablecoinPricesJob } from './refresh-stablecoin-prices.job';

export class JobManager {
  jobs: RecurringJob[] = [];

  constructor() {
    this.addJob(new RefreshStablecoinPricesJob());
    this.addJob(new StablecoinAnomaliesJob());
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
