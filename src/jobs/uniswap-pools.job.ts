import { RecurringJob } from './recurring.job';
import * as schedule from 'node-schedule';
import { main } from '@/config/adapters/liquidity-pools/uniswap-v3/uniswap-v3';

export class UniswapPoolsJob implements RecurringJob {
  doIt(): any {
    console.log('Scheduling UniswapPoolsJob');
    schedule.scheduleJob({ hour: 2, minute: 15 }, () => main());
  }
}
