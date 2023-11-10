import * as schedule from 'node-schedule';
import { main, volumeData } from '@/config/adapters/liquidity-pools/curve/curve';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';

export class CurvePoolsJob implements RecurringJob {
  private readonly jobs: schedule.Job[] = [];

  constructor() {
    logger.info('Scheduling CurvePoolsJob');
    this.jobs.push(
      schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 0, tz: 'Etc/UTC' }, () => {
        logger.info('Executing CurvePoolsJob -> main');
        main().catch(e => {
          logger.error('Exception while executing CurvePoolsJob -> main', e);
        });
      }),
    );

    this.jobs.push(
      schedule.scheduleJob({ hour: 23, minute: 55, tz: 'Etc/UTC' }, () => {
        logger.info('Executing CurvePoolsJob -> volumeData');
        volumeData().catch(e => {
          logger.error('Exception while executing CurvePoolsJob -> volumeData', e);
        });
      }),
    );
  }

  public executeJob(): Promise<void> {
    throw new Error('Not implemented');
  }

  public cancelJob(): void {
    if (this.jobs) {
      this.jobs.forEach(job => job.cancel());
    }
  }
}
