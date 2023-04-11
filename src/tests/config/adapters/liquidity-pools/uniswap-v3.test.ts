import { calculateTokenWeightsAndPricesFromLp, UniswapPoolResponse } from '../../../../config/adapters/liquidity-pools/uniswap-v3/uniswap-v3';

describe('calculateTokenWeightsAndPricesFromLp', () => {
  it('should calculate token weights and prices correctly', () => {
    const lp: UniswapPoolResponse = {
      id: '0x39529e96c28807655b5856b3d342c6225111770e',
      volumeToken0: '479656485.573739768404911016',
      volumeToken1: '479663280.194692',
      volumeUSD: '479819822.3995257255159873908213217',
      totalValueLockedToken0: '27112.766076517722210685',
      totalValueLockedToken1: '26743.744034',
      totalValueLockedUSD: '53856.51011051772221068500000000001',
      token0Price: '1.005075583839519773737009045601912',
      token1Price: '0.9949500476171847875293520599419304',
      liquidity: '148235369494571224',
      token0: {
        symbol: 'TUSD',
        id: '0x0000000000085d4780b73119b644ae5ecd22b376',
        decimals: '18',
        totalValueLocked: '153699.722639189212423601',
        totalValueLockedUSD: '153699.722639189212423601',
      },
      token1: {
        symbol: 'USDC',
        id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: '6',
        totalValueLocked: '713745775.79594',
        totalValueLockedUSD: '713745775.79594',
      },
      poolDayData: [],
    };

    const expectedOutput = {
      token0Weight: 0.5034259743321695,
      token1Weight: 0.4990944287676354,
      token0UsdPrice: 1.0000000000000002,
      token1UsdPrice: 1.0050755838395198,
    };

    expect(calculateTokenWeightsAndPricesFromLp(lp)).toEqual(expectedOutput);
  });
});
