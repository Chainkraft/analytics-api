import moment from 'moment';
import { request } from 'graphql-request';
import BlockchainService from '@/services/blockchain.service';
import LiquidityPoolService from '@/services/liquidity-pools.service';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';
import { uniswapPools } from '@/config/pools/uniswap';
import { LiquidityPoolHistory } from '@/interfaces/liquidity-pool-history.interface';

const baseUrl = 'https://api.thegraph.com/subgraphs/name';
const chains = {
  ethereum: `${baseUrl}/uniswap/uniswap-v3`,
  polygon: `${baseUrl}/ianlapham/uniswap-v3-polygon`,
  arbitrum: `${baseUrl}/ianlapham/arbitrum-dev`,
  optimism: `${baseUrl}/ianlapham/optimism-post-regenesis`,
};
const blockchainService = new BlockchainService();

export const main = async (): Promise<any> => {
  const liquidityPoolService = new LiquidityPoolService();

  const network = 'ethereum';
  const dex = 'uniswap';

  const numberOfDays = 45;
  // get timestamps of the last 14 days using Moment library in GMT timezone
  const timestamps: number[] = [];
  for (let i = 0; i < numberOfDays; i++) {
    timestamps.push(moment().utc().subtract(i, 'days').startOf('day').valueOf());
  }

  for (const pool of uniswapPools) {
    // check pools liquiditypoolhistory in the database by address and network
    const poolHistory = await liquidityPoolService.findLiquiditiyPoolHistoryByAddressAndNetwork(pool.address, network);

    // get latest balances from poolHistory
    const latestBalances = poolHistory?.balances.sort((a, b) => b.date.getTime() - a.date.getTime());
    const latestTimestamp = latestBalances?.[0]?.date.getTime();

    //filter timestamps to get only the ones that are later than the latestTimestamp if latestTimestamp exists
    const missingTimestamps = latestTimestamp ? timestamps.filter(timestamp => timestamp > latestTimestamp) : timestamps;

    for (const ts of missingTimestamps) {
      refreshUniswapPool(network, pool.address, ts);
    }
  }
};

export const refreshAllPools = async (network = 'ethereum'): Promise<LiquidityPoolHistory[]> => {
  return Promise.all(
    uniswapPools.map(pool => {
      return refreshUniswapPool(network, pool.address);
    }),
  );
};

export const dayData = async (): Promise<any> => {
  const liquidityPoolService = new LiquidityPoolService();

  const network = 'ethereum';
  const dex = 'uniswap';

  const numberOfDays = 14;

  for (const pool of uniswapPools) {
    // check pools liquiditypoolhistory in the database by address and network
    const poolHistory = await liquidityPoolService.findLiquiditiyPoolHistoryByAddressAndNetwork(pool.address, network);

    const remotePoolDayDatas = await getUniswapV3PoolDayDatas(network, pool.address, numberOfDays);
    const dbPoolDayDataDates = poolHistory?.poolDayData.map(poolDayData => poolDayData.date.getTime()) ?? [];

    const poolDayDataToUpdate = remotePoolDayDatas.filter(dayData => !dbPoolDayDataDates.includes(dayData.date * 1000));

    if (poolDayDataToUpdate.length === 0) {
      continue;
    }

    await liquidityPoolHistoryModel.findOneAndUpdate(
      { network: network, address: pool.address },
      {
        dex: dex,
        network: network,
        address: pool.address,
        $push: {
          poolDayData: {
            $each: poolDayDataToUpdate.map(dayData => {
              return {
                ...dayData,
                date: dayData.date * 1000,
              };
            }),
          },
        },
      },
      { new: true },
    );
  }
};

export function calculateTokenWeightsAndPricesFromLp(lp: UniswapPoolResponse): {
  token0Weight: number;
  token1Weight: number;
  token0UsdPrice: number;
  token1UsdPrice: number;
} {
  //bear in mind below:
  // # token0 per token1
  // token0Price: BigDecimal!
  // # token1 per token0
  // token1Price: BigDecimal!

  // sometimes subgraph is tricky and returns wrong values
  const tvlToken0 = Number(lp.totalValueLockedToken0) < 0 ? 0 : Number(lp.totalValueLockedToken0);
  const tvlToken1 = Number(lp.totalValueLockedToken1) < 0 ? 0 : Number(lp.totalValueLockedToken1);

  // Calculate token weights
  const tvlUSD = Number(lp.totalValueLockedUSD);

  const token0Amount = tvlToken0;
  const token1Amount = Number(lp.token0Price) * tvlToken1;

  const tvlNormalized = token0Amount + token1Amount;
  const token0Weight = token0Amount / tvlNormalized;
  const token1Weight = token1Amount / tvlNormalized;

  const token0UsdPrice = tvlToken0 > 0 ? (tvlUSD * token0Weight) / tvlToken0 : 0;
  const token1UsdPrice = tvlToken1 > 0 ? (tvlUSD * token1Weight) / tvlToken1 : 0;

  return {
    token0Weight,
    token1Weight,
    token0UsdPrice,
    token1UsdPrice,
  };
}

export async function refreshUniswapPool(network: string, poolId: string, timestamp?: number): Promise<LiquidityPoolHistory> {
  let lp;
  let block;

  if (timestamp) {
    const blocks = await blockchainService.getBlocksByTime([timestamp / 1000], network);
    block = blocks[0];
    lp = await getUniswapV3Pool(network, poolId, block);
  } else {
    lp = await getUniswapV3PoolCurrentState(network, poolId);
  }

  if (lp === null) return;

  const calculations = calculateTokenWeightsAndPricesFromLp(lp);

  return liquidityPoolHistoryModel.findOneAndUpdate(
    { network: network, address: lp.id },
    {
      dex: 'uniswap',
      network: network,
      name: '',
      symbol: '',
      assetTypeName: '',
      isMetaPool: false,
      usdTotal: lp.totalValueLockedUSD,
      tvlUSD: lp.totalValueLockedUSD,
      volumeUSD: lp.volumeUSD,
      $push: {
        balances: {
          coins: [
            {
              address: lp.token0.id,
              symbol: lp.token0.symbol,
              decimals: 0, //remotePool.token0.decimals,
              usdPrice: calculations.token0UsdPrice,
              price: lp.token0Price,
              // added by us
              poolBalance: Number(lp.totalValueLockedToken0) < 0 ? 0 : lp.totalValueLockedToken0,
              weight: calculations.token0Weight,
            },
            {
              address: lp.token1.id,
              symbol: lp.token1.symbol,
              decimals: 0, //remotePool.token1.decimals,
              usdPrice: calculations.token1UsdPrice,
              price: lp.token1Price,
              // added by us
              poolBalance: Number(lp.totalValueLockedToken1) < 0 ? 0 : lp.totalValueLockedToken1,
              weight: calculations.token1Weight,
            },
          ],
          date: timestamp ? new Date(timestamp) : new Date(),
          block: timestamp ? block : undefined,
        },
      },
    },
    { upsert: true, new: true },
  );
}

export async function refreshUniswapPoolForTimestamp(network: string, poolId: string, timestamp: number): Promise<LiquidityPoolHistory> {
  const blocks = await blockchainService.getBlocksByTime([timestamp / 1000], network);

  const lp = await getUniswapV3Pool(network, poolId, blocks[0]);
  if (lp === null) return;

  const calculations = calculateTokenWeightsAndPricesFromLp(lp);

  return liquidityPoolHistoryModel.findOneAndUpdate(
    { network: network, address: lp.id },
    {
      dex: 'uniswap',
      network: network,
      name: '',
      symbol: '',
      assetTypeName: '',
      isMetaPool: false,
      usdTotal: lp.totalValueLockedUSD,
      tvlUSD: lp.totalValueLockedUSD,
      volumeUSD: lp.volumeUSD,
      $push: {
        balances: {
          coins: [
            {
              address: lp.token0.id,
              symbol: lp.token0.symbol,
              decimals: 0, //remotePool.token0.decimals,
              usdPrice: calculations.token0UsdPrice,
              price: lp.token0Price,
              // added by us
              poolBalance: Number(lp.totalValueLockedToken0) < 0 ? 0 : lp.totalValueLockedToken0,
              weight: calculations.token0Weight,
            },
            {
              address: lp.token1.id,
              symbol: lp.token1.symbol,
              decimals: 0, //remotePool.token1.decimals,
              usdPrice: calculations.token1UsdPrice,
              price: lp.token1Price,
              // added by us
              poolBalance: Number(lp.totalValueLockedToken1) < 0 ? 0 : lp.totalValueLockedToken1,
              weight: calculations.token1Weight,
            },
          ],
          date: new Date(timestamp),
          block: blocks[0],
        },
      },
    },
    { upsert: true, new: true },
  );
}

export const getUniswapV3PoolCurrentState = async (chain: string, poolId: string): Promise<UniswapPoolResponse> => {
  const variables = {
    id: poolId,
  };
  const data = await request(chains[chain], queryCurrentPool, variables);
  return data.pool;
};

export const getUniswapV3Pool = async (chain: string, poolId: string, block: number): Promise<UniswapPoolResponse> => {
  const variables = {
    id: poolId,
    block: block,
  };
  const data = await request(chains[chain], queryPool, variables);
  return data.pool;
};

export const getUniswapV3PoolForBlocks = async (chain: string, poolId: string, block: number[]): Promise<UniswapPoolResponse[]> => {
  // loop through blocks and get the pool data
  const poolData = [];
  for (let i = 0; i < block.length; i++) {
    const data = await getUniswapV3Pool(chain, poolId, block[i]);
    poolData.push(data);
  }

  return poolData;
};

// get uniswap v3 pool day datas for a pool
export const getUniswapV3PoolDayDatas = async (chain: string, poolId: string, days: number): Promise<PoolDayData[]> => {
  const variables = {
    pool: poolId,
    days: days,
  };
  const data = await request(chains[chain], queryPoolDayDatas, variables);
  return data.poolDayDatas;
};

interface UniswapPoolToken {
  symbol: string;
  id: string;
  decimals: string;
  totalValueLocked: string; // overall tvl for token
  totalValueLockedUSD: string; // overall tvl for token
}

interface PoolDayData {
  date: number;
  tvlUSD: number;
  volumeToken0: number;
  volumeToken1: number;
  volumeUSD: number;
  token0Price: number;
  token1Price: number;
}

export interface UniswapPoolResponse {
  id: string;
  volumeToken0: string;
  volumeToken1: string;
  volumeUSD: string;
  totalValueLockedToken0: string; // tvl in this pool
  totalValueLockedToken1: string; // tvl in this pool
  totalValueLockedUSD: string;
  token0Price: string;
  token1Price: string;
  liquidity: string;
  token0: UniswapPoolToken;
  token1: UniswapPoolToken;
  poolDayData: PoolDayData[];
}

const queryPool = /* GraphQL */ `
  query getPool($id: String!, $block: Int!) {
    pool(id: $id, block: { number: $block }) {
      id
      volumeToken0
      volumeToken1
      volumeUSD
      totalValueLockedToken0
      totalValueLockedToken1
      totalValueLockedUSD
      token0Price
      token1Price
      liquidity
      token0 {
        symbol
        id
        decimals
        totalValueLocked
        totalValueLockedUSD
      }
      token1 {
        symbol
        id
        decimals
        totalValueLocked
        totalValueLockedUSD
      }
    }
  }
`;

const queryCurrentPool = /* GraphQL */ `
  query getPool($id: String!) {
    pool(id: $id) {
      id
      volumeToken0
      volumeToken1
      volumeUSD
      totalValueLockedToken0
      totalValueLockedToken1
      totalValueLockedUSD
      token0Price
      token1Price
      liquidity
      token0 {
        symbol
        id
        decimals
        totalValueLocked
        totalValueLockedUSD
      }
      token1 {
        symbol
        id
        decimals
        totalValueLocked
        totalValueLockedUSD
      }
    }
  }
`;

const queryPoolDayDatas = /* GraphQL */ `
  query getPoolDayDatas($pool: String!, $days: Int!) {
    poolDayDatas(first: $days, orderBy: date, orderDirection: desc, where: { pool: $pool }) {
      date
      tvlUSD
      volumeUSD
      token0Price
      token1Price
      volumeToken0
      volumeToken1
    }
  }
`;
