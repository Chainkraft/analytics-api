import { RecurringJob } from './recurring.job';
import * as schedule from 'node-schedule';
/* 
  Job for schedule testing.
*/
export class TestJob implements RecurringJob {
  doIt() {
    console.log('Scheduling TestJob');
    const rule = new schedule.RecurrenceRule();
    rule.hour = 20;
    schedule.scheduleJob(rule, () => this.doTheJob());
  }

  doTheJob(): any {
    console.log('TestJob is done at ' + new Date());
  }
}
