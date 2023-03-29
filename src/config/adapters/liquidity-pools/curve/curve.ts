import {
  ICoinFromPoolDataApi,
  IExtendedPoolDataFromApi,
  INetworkName,
  ISubgraphPoolData,
  LiquidityPoolHistory,
  LiquidityPoolPricingType,
  ShortLiquidityPool,
  StablecoinLiquidityPoolSummary,
} from '@/interfaces/liquidity-pool-history.interface';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';
import TokenService from '@/services/tokens.service';
import axios from 'axios';
import memoize from 'memoizee';

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

export const _getSubgraphData = memoize(
  async (network: INetworkName): Promise<ISubgraphPoolData[]> => {
    const url = `https://api.curve.fi/api/getSubgraphData/${network}`;
    const response = await axios.get(url, { validateStatus: () => true });
    return response.data.data.poolList ?? [];
  },
  {
    promise: true,
    maxAge: 5 * 60 * 1000, // 5m
  },
);

export const groupPoolAddressesFromApiByCoinSymbol = async (
  network: INetworkName,
  poolType: 'main' | 'crypto' | 'factory' | 'factory-crypto',
): Promise<StablecoinLiquidityPoolSummary[]> => {
  const tokenService = new TokenService();
  const remotePools = await _getPoolsFromApi(network, poolType);
  const tokens = await tokenService.findAllToken();

  const groupedPools: Record<string, ShortLiquidityPool[]> = {};
  remotePools.poolData.forEach(pool => {
    const coinSymbols = pool.underlyingCoins ? pool.underlyingCoins : pool.coins;
    coinSymbols.forEach(coin => {
      if (!groupedPools[coin.symbol]) {
        groupedPools[coin.symbol] = [];
      }
      groupedPools[coin.symbol].push({ name: pool.name, network: network, address: pool.address, dex: 'curve' });
    });
  });
  const returnObj = Object.entries(groupedPools).map(([tokenSymbol, pools]) => ({
    tokenSymbol,
    tokenSlug: tokens.find(token => token.symbol === tokenSymbol)?.slug,
    pools,
  }));
  return returnObj;
};

export const main = async (): Promise<LiquidityPoolHistory[]> => {
  const network = 'ethereum';
  const dex = 'curve';

  console.log(`Curve ${network} pools synchronization.`);

  const remotePools = await _getPoolsFromApi(network, 'main');

  return Promise.all(
    remotePools.poolData.map(remotePool => {
      if (remotePool.usdTotal < 1000) return;

      return liquidityPoolHistoryModel.findOneAndUpdate(
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
          tvlUSD: remotePool.usdTotal,
          pricingType: LiquidityPoolPricingType.USD,
          $push: {
            balances: {
              coins: calculateCoinsWeights(remotePool.coins, remotePool.usdTotal),
              date: new Date(),
            },
            underlyingBalances: {
              coins: calculateCoinsWeights(remotePool.underlyingCoins, remotePool.usdTotal),
              date: new Date(),
            },
          },
        },
        { upsert: true, new: true },
      );
    }),
  );
};

export const volumeData = async (): Promise<LiquidityPoolHistory[]> => {
  const network = 'ethereum';
  const dex = 'curve';

  const subgraphData = await _getSubgraphData(network);

  return Promise.all(
    subgraphData.map(remotePool => {
      if (remotePool.volumeUSD < 1000) return;

      return liquidityPoolHistoryModel.findOneAndUpdate(
        { network: network, address: remotePool.address },
        {
          dex: dex,
          network: network,
          address: remotePool.address,
          pricingType: LiquidityPoolPricingType.USD,
          $push: {
            poolDayData: {
              volumeUSD: subgraphData.find(pool => pool.address === remotePool.address)?.volumeUSD,
              date: new Date(),
            },
          },
        },
        { upsert: true, new: true },
      );
    }),
  );
};

export function calculateCoinsWeights(coins: ICoinFromPoolDataApi[], totalBalance: number): ICoinFromPoolDataApi[] {
  return coins?.map(coin => {
    const shiftedBalance = Number(coin.poolBalance) * Math.pow(10, -Number(coin.decimals));
    return {
      ...coin,
      weight: Number(shiftedBalance) / totalBalance,
    };
  });
}
