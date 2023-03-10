import { RecurringJob } from './recurring.job';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';
import * as schedule from 'node-schedule';
import { main } from '@/config/adapters/liquidity-pools/curve/curve';

export class CurvePoolsJob implements RecurringJob {
  public lpBalanceHistory = liquidityPoolHistoryModel;

  doIt(): any {
    console.log('Scheduling CurvePoolsJob');
    schedule.scheduleJob({ hour: 2, minute: 0 }, () => main());
  }
}
