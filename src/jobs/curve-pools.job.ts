import { RecurringJob } from './recurring.job';
import axios from 'axios';
import memoize from 'memoizee';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';
import { LiquidityPoolHistory, IExtendedPoolDataFromApi, INetworkName } from '@/interfaces/liquidity-pool-history.interface';
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
    schedule.scheduleJob({ hour: 2, minute: 0 }, () => this.refreshCurvePools());
  }

  async refreshCurvePools(): Promise<LiquidityPoolHistory[]> {
    const network = 'ethereum';
    const dex = 'curve';

    const remotePools = await _getPoolsFromApi(network, 'main');

    console.log('CurvePoolsJob', remotePools.poolData.length, 'pools to update');

    return Promise.all(
      remotePools.poolData.map(remotePool => {
        return this.lpBalanceHistory.findOneAndUpdate(
          { network: network, address: remotePool.address },
          {
            dex: dex,
            network: network,
            name: remotePool.name,
            symbol: remotePool.symbol,
            assetTypeName: remotePool.assetTypeName,
            address: remotePool.address,
            isMetaPool: remotePool.isMetaPool,
            usdTotal: remotePool.usdTotal,
            usdtotalExcludingBasePool: remotePool.usdtotalExcludingBasePool,
            $push: {
              balances: {
                coins: remotePool.coins,
                date: new Date(),
              },
              underlyingBalances: {
                coins: remotePool.underlyingCoins,
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
