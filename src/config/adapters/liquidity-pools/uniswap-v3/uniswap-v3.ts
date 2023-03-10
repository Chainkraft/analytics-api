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

export const main = async (): Promise<any> => {
  const blockchainService = new BlockchainService();
  const liquidityPoolService = new LiquidityPoolService();

  const network = 'ethereum';
  const dex = 'uniswap';

  const numberOfDays = 14;
  // get timestamps of the last 14 days using Moment library in GMT timezone
  const timestamps = [];
  for (let i = 0; i < numberOfDays; i++) {
    timestamps.push(moment().utc().subtract(i, 'days').startOf('day').valueOf());
  }

  const lastDaysBlocks = await blockchainService.getBlocksByTime(
    timestamps.map(value => value / 1000),
    network,
  );

  for (const pool of uniswapPools) {
    // check pools liquiditypoolhistory in the database by address and network
    const poolHistory = await liquidityPoolService.findLiquiditiyPoolHistoryByAddressAndNetwork(pool.address, network);

    // get latest balances from poolHistory
    const latestBalances = poolHistory?.balances.sort((a, b) => b.date.getTime() - a.date.getTime());
    const latestTimestamp = latestBalances?.[0]?.date.getTime();

    //filter timestamps to get only the ones that are later than the latestTimestamp if latestTimestamp exists
    const missingTimestamps = latestTimestamp ? timestamps.filter(timestamp => timestamp > latestTimestamp) : timestamps;

    // get blocks for missing timestamps based on indexes from timestamps array
    const blocks = missingTimestamps.map(timestamp => lastDaysBlocks[timestamps.indexOf(timestamp)]);

    // browse for the past days and save to the db
    const remotePoolData = await getUniswapV3PoolForBlocks(network, pool.address, blocks);

    const balancesToUpdate = remotePoolData.map((lp, index) => {
      const calculations = calculateTokenWeightsAndPricesFromLp(lp);

      return {
        coins: [
          {
            // Token 0
            address: lp.token0.id,
            symbol: lp.token0.symbol,
            decimals: 0, //remotePool.token0.decimals,
            usdPrice: calculations.token0UsdPrice,
            price: lp.token0Price,
            poolBalance: lp.totalValueLockedToken0,
            weight: calculations.token0Weight,
          },
          {
            // Token 1
            address: lp.token1.id,
            symbol: lp.token1.symbol,
            decimals: 0, //remotePool.token1.decimals,
            usdPrice: calculations.token1UsdPrice,
            price: lp.token1Price,
            poolBalance: lp.totalValueLockedToken1,
            weight: calculations.token1Weight,
          },
        ],
        date: new Date(missingTimestamps[index]),
        block: blocks[index],
      };
    });

    if (remotePoolData.length === 0) {
      continue;
    }

    const remotePool = remotePoolData[0];

    await liquidityPoolHistoryModel.findOneAndUpdate(
      { network: network, address: remotePool.id },
      {
        dex: dex,
        network: network,
        name: '',
        symbol: '',
        assetTypeName: '',
        address: remotePool.id,
        isMetaPool: false,
        usdTotal: remotePool?.totalValueLockedUSD ?? 0,
        $push: {
          balances: {
            $each: balancesToUpdate.map(balance => {
              return {
                coins: [
                  {
                    address: balance.coins[0].address,
                    symbol: balance.coins[0].symbol,
                    decimals: 0, //remotePool.token0.decimals,
                    usdPrice: balance.coins[0].usdPrice,
                    price: balance.coins[0].price,
                    // added by us
                    poolBalance: balance.coins[0].poolBalance,
                    weight: balance.coins[0].weight,
                  },
                  {
                    address: balance.coins[1].address,
                    symbol: balance.coins[1].symbol,
                    decimals: 0, //remotePool.token0.decimals,
                    usdPrice: remotePool.token0Price,
                    price: balance.coins[1].price,
                    // added by us
                    poolBalance: balance.coins[1].poolBalance,
                    weight: balance.coins[1].weight,
                  },
                ],
                date: balance.date,
                block: balance.block,
              };
            }),
          },
        },
        tvlUSD: remotePool.totalValueLockedUSD,
        volumeUSD: remotePool.volumeUSD,
      },
      { upsert: true, new: true },
    );

    const remotePoolDayDatas = await getUniswapV3PoolDayDatas(network, pool.address, numberOfDays);
    const dbPoolDayDataDates = poolHistory?.poolDayData.map(poolDayData => poolDayData.date.getTime()) ?? [];

    const poolDayDataToUpdate = remotePoolDayDatas.filter(dayData => !dbPoolDayDataDates.includes(dayData.date * 1000));

    if (poolDayDataToUpdate.length === 0) {
      continue;
    }

    await liquidityPoolHistoryModel.findOneAndUpdate(
      { network: network, address: pool.address },
      {
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
  // Calculate token weights
  const tvlUSD = Number(lp.totalValueLockedUSD);
  const token0Weight = Number(lp.totalValueLockedToken0) / tvlUSD;
  const token1Weight = (Number(lp.totalValueLockedToken1) * Number(lp.token0Price)) / tvlUSD;

  // Calculate token USD prices
  const token0UsdPrice = (tvlUSD * token0Weight) / Number(lp.totalValueLockedToken0);
  const token1UsdPrice = (tvlUSD * token1Weight) / Number(lp.totalValueLockedToken1);

  return {
    token0Weight,
    token1Weight,
    token0UsdPrice,
    token1UsdPrice,
  };
}

export async function refreshUniswapPool(network: string, poolId: string): Promise<LiquidityPoolHistory> {
  // browse for the past days and save to the db
  const lp = await getUniswapV3PoolCurrentState(network, poolId);

  const calculations = calculateTokenWeightsAndPricesFromLp(lp);

  return liquidityPoolHistoryModel.findOneAndUpdate(
    { network: network, address: lp.id },
    {
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
              poolBalance: lp.totalValueLockedToken0,
              weight: calculations.token0Weight,
            },
            {
              address: lp.token1.id,
              symbol: lp.token1.symbol,
              decimals: 0, //remotePool.token1.decimals,
              usdPrice: calculations.token1UsdPrice,
              price: lp.token1Price,
              // added by us
              poolBalance: lp.totalValueLockedToken1,
              weight: calculations.token1Weight,
            },
          ],
          date: new Date(),
        },
      },
    },
    { new: true },
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

interface UniswapPoolResponse {
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
