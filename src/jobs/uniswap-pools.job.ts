import * as schedule from 'node-schedule';
import { dayData, refreshAllPools } from '@/config/adapters/liquidity-pools/uniswap-v3/uniswap-v3';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';

export class UniswapPoolsJob implements RecurringJob {
  private readonly jobs: schedule.Job[] = [];

  constructor() {
    logger.info('Scheduling UniswapPoolsJob');
    this.jobs.push(
      schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 5, tz: 'Etc/UTC' }, () => {
        logger.info('Executing UniswapPoolsJob -> refreshAllPools');
        refreshAllPools().catch(e => {
          logger.error('Exception while executing UniswapPoolsJob -> refreshAllPools', e);
        });
      }),
    );

    this.jobs.push(
      schedule.scheduleJob({ hour: 23, minute: 55, tz: 'Etc/UTC' }, () => {
        logger.info('Executing UniswapPoolsJob -> dayData');
        dayData().catch(e => {
          logger.error('Exception while executing UniswapPoolsJob -> dayData', e);
        });
      }),
    );
  }

  public executeJob(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public cancelJob(): void {
    if (this.jobs) {
      this.jobs.forEach(job => job.cancel());
    }
  }
}
