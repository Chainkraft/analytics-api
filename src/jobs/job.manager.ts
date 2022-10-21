import { RecurringJob } from './recurring.job';
import { ContractImport } from '@/jobs/contracts-import.job';

export class JobManager {
  jobs: RecurringJob[] = [];

  constructor() {
    //this.addJob(new RefreshStablecoinPricesJob());
    //this.addJob(new StablecoinAnomaliesJob());
    this.addJob(new ContractImport());
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
