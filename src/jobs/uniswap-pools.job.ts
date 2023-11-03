import { RecurringJob } from './recurring.job';
import * as schedule from 'node-schedule';
import { dayData, refreshAllPools } from '@/config/adapters/liquidity-pools/uniswap-v3/uniswap-v3';

export class UniswapPoolsJob implements RecurringJob {
  doIt(): any {
    console.log('Scheduling UniswapPoolsJob');
    schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 5, tz: 'Etc/UTC' }, () =>
      refreshAllPools().catch(e => {
        console.error('Exception occurred while executing UniswapPoolsJob', e);
      }),
    );
    schedule.scheduleJob({ hour: 23, minute: 55, tz: 'Etc/UTC' }, () =>
      dayData().catch(e => {
        console.error('Exception occurred while executing UniswapPoolsJob', e);
      }),
    );
  }
}
