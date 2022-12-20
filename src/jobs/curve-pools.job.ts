import { RecurringJob } from './recurring.job';
import axios from 'axios';
import memoize from 'memoizee';
import { IExtendedPoolDataFromApi, INetworkName } from '../interfaces/curve-interfaces';
import liquidityPoolHistoryModel from '@/models/lp-history.model';
import { LiquidityPoolHistory } from '@/interfaces/curve-interfaces';
import * as schedule from 'node-schedule';

// Taken from curve-js lib
export const _getPoolsFromApi = memoize(
  async (network: INetworkName, poolType: 'main' | 'crypto' | 'factory' | 'factory-crypto'): Promise<IExtendedPoolDataFromApi> => {
    const url = `https://api.curve.fi/api/getPools/${network}/${poolType}`;
    const response = await axios.get(url, { validateStatus: () => true });
    return response.data.data ?? { poolData: [], tvl: 0, tvlAll: 0 };
  },
  {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
  },
);

export class CurvePoolsJob implements RecurringJob {
  public lpBalanceHistory = liquidityPoolHistoryModel;

  doIt(): any {
    console.log('Scheduling CurvePoolsJob');
    schedule.scheduleJob({ hour: 5, minute: 0 }, () => this.refreshCurvePools());
  }

  async refreshCurvePools(): Promise<LiquidityPoolHistory[]> {
    const remotePools = await _getPoolsFromApi('ethereum', 'main');

    return Promise.all(
      remotePools.poolData.map(remotePool => {
        return this.lpBalanceHistory.findOneAndUpdate(
          { symbol: remotePool.symbol },
          {
            dex: 'curve',
            name: remotePool.name,
            $push: {
              balances: {
                coins: remotePool.coins,
                date: new Date(),
              },
            },
          },
          {
            new: true,
            upsert: true,
          },
        );
      }),
    );
  }
}
