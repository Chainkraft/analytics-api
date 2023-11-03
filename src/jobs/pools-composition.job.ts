import { RecurringJob } from './recurring.job';
import * as schedule from 'node-schedule';
import NotificationService from '@services/notifications.service';
import {
  Notification,
  NotificationSeverity,
  NotificationLiquidityPoolCompositionChangeDataSchema,
  NotificationType,
} from '@interfaces/notifications.interface';
import { LiquidityPoolHistory } from '@/interfaces/liquidity-pool-history.interface';
import moment from 'moment';
import LiquidityPoolService from '@/services/liquidity-pools.service';
import TokenService from '@services/tokens.service';

export class PoolsCompositionNotificationsJob implements RecurringJob {
  public tokenService = new TokenService();
  public notificationService = new NotificationService();
  public liquidityPoolsService = new LiquidityPoolService();

  doIt(): any {
    console.log('Scheduling PoolsCompositionNotificationsJob');
    schedule.scheduleJob({ hour: new schedule.Range(0, 23, 4), minute: 10, tz: 'Etc/UTC' }, () =>
      this.generateNotifications().catch(e => {
        console.error('Exception occurred while executing PoolsCompositionNotificationsJob', e);
      }),
    );
  }

  async generateNotifications() {
    const liquidityPools: LiquidityPoolHistory[] = await this.liquidityPoolsService.findAllLiquiditiyPoolHistories();
    const latestNotifications: Notification[] = await this.notificationService.notifications
      .find({
        type: NotificationType.LP_COMPOSITION_CHANGE,
        createdAt: {
          $gt: moment().subtract(48, 'hours').toDate(),
        },
      })
      .sort({
        createdAt: 'asc',
      })
      .populate('liquidityPool');

    const newNotifications: Notification[] = [];
    for (const pool of liquidityPools) {
      const poolNotifications = await this.detectWeightChangeInPool(pool, latestNotifications);
      newNotifications.push(...poolNotifications);
    }

    console.log('PoolsCompositionNotificationsJob generated notifications:', newNotifications);

    return Promise.all(
      newNotifications.map(notification => {
        this.notificationService.createNotification(notification);
      }),
    );
  }

  async detectWeightChangeInPool(poolHistory: LiquidityPoolHistory, notifications: Notification[]): Promise<Notification[]> {
    const timeWindowHours = 48;
    const newNotifications: Notification[] = [];

    //filter notifications for particular pool
    notifications = notifications.filter(notification => notification.liquidityPool?.address === poolHistory.address);

    // Sort balances by date
    poolHistory.balances.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

    // Get the latest balance
    const latestBalance = poolHistory.balances[poolHistory.balances.length - 1];
    const currentTime = moment(latestBalance.date);
    const startWindowTime = currentTime.clone().subtract(timeWindowHours, 'hours');

    // Get balances from time window
    const balancesInWindow = poolHistory.balances.filter(b => {
      const balanceTime = moment(b.date);
      return balanceTime.isBetween(startWindowTime, currentTime);
    });

    let weightChangeThreshold = 0.2;
    if (poolHistory.tvlUSD < 1_000_000) {
      return newNotifications;
    } else if (poolHistory.tvlUSD >= 1_000_000 && poolHistory.tvlUSD < 10_000_000) {
      weightChangeThreshold = 0.3;
    }

    const numberOfTokens = latestBalance.coins.length > 0 ? latestBalance.coins.length : 1;
    const equilibriumWeight = 1 / numberOfTokens;

    for (const coin of latestBalance.coins) {
      const lastNotificationForCoin = notifications.filter(notification => notification.data && notification.data.token === coin.symbol).pop();
      const token = await this.tokenService.tokens.findOne({ symbol: coin.symbol });

      let lastNotificationWeight: number | null = null;

      if (lastNotificationForCoin) {
        lastNotificationWeight = lastNotificationForCoin.data.weight;
      }

      if (lastNotificationWeight !== null) {
        const weightChange = coin.weight - lastNotificationWeight;

        // Check if moving away from equilibrium
        if (
          (lastNotificationWeight < equilibriumWeight && coin.weight < lastNotificationWeight) ||
          (lastNotificationWeight > equilibriumWeight && coin.weight > lastNotificationWeight) ||
          (lastNotificationWeight === equilibriumWeight && coin.weight !== equilibriumWeight)
        ) {
          if (Math.abs(weightChange) > weightChangeThreshold) {
            const existingNotification = newNotifications.find(
              n => n.data && n.data.token === coin.symbol && Math.abs(n.data.weight - coin.weight) < weightChangeThreshold,
            );

            if (!existingNotification) {
              console.log(
                'PoolsCompositionNotificationsJob',
                `[${poolHistory.address}] Coin ${coin.symbol} has changed its weight by ${(weightChange * 100).toFixed(2)}% between ${
                  lastNotificationForCoin?.createdAt
                } and ${latestBalance.date}`,
              );

              newNotifications.push({
                type: NotificationType.LP_COMPOSITION_CHANGE,
                severity: NotificationSeverity.CRITICAL,
                liquidityPool: poolHistory,
                token: token,
                data: <NotificationLiquidityPoolCompositionChangeDataSchema>{
                  token: coin.symbol,
                  weight: coin.weight,
                  weightChange: weightChange,
                  balance: Number(coin.poolBalance) * Math.pow(10, -Number(coin.decimals)),
                  date: latestBalance.date,
                },
              });
            }
          }
        }
      } else {
        for (let i = 0; i < balancesInWindow.length; i++) {
          const prevBalance = balancesInWindow[i];
          const prevCoin = prevBalance.coins.find(prevCoin => prevCoin.symbol === coin.symbol);
          const weightChange = coin.weight - prevCoin.weight;

          if (
            (prevCoin.weight < equilibriumWeight && coin.weight < prevCoin.weight) ||
            (prevCoin.weight > equilibriumWeight && coin.weight > prevCoin.weight) ||
            (prevCoin.weight === equilibriumWeight && coin.weight !== equilibriumWeight)
          ) {
            if (Math.abs(weightChange) > weightChangeThreshold) {
              const existingNotification = newNotifications.find(
                n => n.data && n.data.token === coin.symbol && Math.abs(n.data.weight - coin.weight) < weightChangeThreshold,
              );

              if (!existingNotification) {
                console.log(
                  'PoolsCompositionNotificationsJob',
                  `[${poolHistory.address}] Coin ${coin.symbol} has changed its weight by ${(weightChange * 100).toFixed(2)}% between ${
                    prevBalance.date
                  } and ${latestBalance.date}`,
                );

                newNotifications.push({
                  type: NotificationType.LP_COMPOSITION_CHANGE,
                  severity: NotificationSeverity.CRITICAL,
                  liquidityPool: poolHistory,
                  token: token,
                  data: <NotificationLiquidityPoolCompositionChangeDataSchema>{
                    token: coin.symbol,
                    weight: coin.weight,
                    weightChange: weightChange,
                    balance: Number(coin.poolBalance) * Math.pow(10, -Number(coin.decimals)),
                    date: latestBalance.date,
                  },
                });
              }
            }
          }
        }
      }
    }

    return newNotifications;
  }
}
