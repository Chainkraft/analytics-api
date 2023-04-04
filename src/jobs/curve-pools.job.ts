import { RecurringJob } from './recurring.job';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';
import * as schedule from 'node-schedule';
import { main, volumeData } from '@/config/adapters/liquidity-pools/curve/curve';

export class CurvePoolsJob implements RecurringJob {
  public lpBalanceHistory = liquidityPoolHistoryModel;

  doIt(): any {
    console.log('Scheduling CurvePoolsJob');
    schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 0, tz: 'Etc/UTC' }, () => main());
    schedule.scheduleJob({ hour: 23, minute: 55, tz: 'Etc/UTC' }, () => volumeData());
  }
}
