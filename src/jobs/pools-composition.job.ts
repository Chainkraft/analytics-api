import { RecurringJob } from './recurring.job';
import * as schedule from 'node-schedule';
import NotificationService from '@services/notifications.service';
import {
  Notification,
  NotificationSeverity,
  NotificationLiquidityPoolCompositionChange,
  NotificationType,
} from '@interfaces/notifications.interface';
import { LiquidityPoolHistory } from '@/interfaces/liquidity-pool-history.interface';
import moment from 'moment';
import LiquidityPoolService from '@/services/liquidity-pools.service';

export class PoolsCompositionNotificationsJob implements RecurringJob {
  public notificationService = new NotificationService();
  public liquidityPoolsService = new LiquidityPoolService();

  doIt(): any {
    console.log('Scheduling PoolsCompositionNotificationsJob');
    schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 10, tz: 'Etc/UTC' }, () => this.generateNotifications());
  }

  async generateNotifications() {
    const liquidityPools: LiquidityPoolHistory[] = await this.liquidityPoolsService.findAllLiquiditiyPoolHistories();
    const latestNotifications: Notification[] = await this.notificationService.notifications.find({
      type: NotificationType.LP_COMPOSITION_CHANGE,
      createdAt: {
        $gt: moment().subtract(48, 'hours').toDate(),
      },
    });

    const newNotifications: Notification[] = [];
    for (const pool of liquidityPools) {
      const poolNotifications = this.detectWeightChangeInPool(pool, latestNotifications);
      newNotifications.push(...poolNotifications);
    }

    console.log('PoolsCompositionNotificationsJob generated notifications:', newNotifications);

    return Promise.all(
      newNotifications.map(notification => {
        this.notificationService.createNotification(notification);
      }),
    );
  }

  detectWeightChangeInPool(poolHistory: LiquidityPoolHistory, notifications: Notification[]): Notification[] {
    const timeWindowHours = 48;
    const newNotifications: Notification[] = [];

    // Sort balances by date
    poolHistory.balances.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

    // Get the latest balance
    const latestBalance = poolHistory.balances[poolHistory.balances.length - 1];
    const currentTime = moment(latestBalance.date);
    const startWindowTime = currentTime.clone().subtract(timeWindowHours, 'hours');

    const balancesInWindow = poolHistory.balances.filter(b => {
      const balanceTime = moment(b.date);
      return balanceTime.isBetween(startWindowTime, currentTime);
    });

    let weightChangeThreshold = 0.1;
    if (poolHistory.tvlUSD < 1_000_000) {
      return newNotifications;
    } else if (poolHistory.tvlUSD >= 1_000_000 && poolHistory.tvlUSD < 10_000_000) {
      weightChangeThreshold = 0.3;
    }

    balancesInWindow.forEach(prevBalance => {
      latestBalance.coins.forEach(coin => {
        const prevCoin = prevBalance.coins.find(prevCoin => prevCoin.symbol === coin.symbol);

        const weightChange = Math.abs(coin.weight - prevCoin.weight);
        const weightChangeValue = coin.weight - prevCoin.weight;
        const hoursDifference = currentTime.diff(moment(prevBalance.date), 'hours', true);

        if (hoursDifference <= timeWindowHours && weightChange > weightChangeThreshold) {
          const existingNotification = notifications.find(
            n =>
              n.data &&
              n.liquidityPool.address === poolHistory.address &&
              n.data.token === coin.symbol &&
              Math.abs(n.data.weight - coin.weight) < 0.1,
            // moment(n.data.date).isSame(currentTime, 'minute'),
          );

          if (!existingNotification) {
            console.log(
              `[${poolHistory.address}] Coin ${coin.symbol} has changed its weight by ${(weightChangeValue * 100).toFixed(2)}% between ${
                prevBalance.date
              } and ${latestBalance.date}`,
            );

            newNotifications.push({
              type: NotificationType.LP_COMPOSITION_CHANGE,
              severity: NotificationSeverity.CRITICAL,
              liquidityPool: poolHistory,
              data: <NotificationLiquidityPoolCompositionChange>{
                token: coin.symbol,
                weight: coin.weight,
                weightChange: weightChangeValue,
                balance: Number(coin.poolBalance) * Math.pow(10, -Number(coin.decimals)),
                date: latestBalance.date,
              },
            });
          }
        }
      });
    });

    return newNotifications;
  }
}
