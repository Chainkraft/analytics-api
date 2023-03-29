import { RecurringJob } from './recurring.job';
import * as schedule from 'node-schedule';
import { dayData, main } from '@/config/adapters/liquidity-pools/uniswap-v3/uniswap-v3';

export class UniswapPoolsJob implements RecurringJob {
  doIt(): any {
    console.log('Scheduling UniswapPoolsJob');
    schedule.scheduleJob({ hour: 0, minute: 15, tz: 'Etc/UTC' }, () => main());
    schedule.scheduleJob({ hour: 23, minute: 55, tz: 'Etc/UTC' }, () => dayData());
  }
}
