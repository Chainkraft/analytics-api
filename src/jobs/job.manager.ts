import { PeggedAssetAnomaliesJob } from './pegged.anomalies.job';
import { RecurringJob } from './recurring.job';

export class JobManager {
  jobs: RecurringJob[] = [];

  constructor() {
    this.addJob(new PeggedAssetAnomaliesJob());
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
