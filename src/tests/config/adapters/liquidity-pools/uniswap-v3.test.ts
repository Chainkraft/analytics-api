import { calculateTokenWeightsAndPricesFromLp, UniswapPoolResponse } from '../../../../config/adapters/liquidity-pools/uniswap-v3/uniswap-v3';

describe('calculateTokenWeightsAndPricesFromLp', () => {
  it('should calculate token weights and prices correctly for stablecoin pool', () => {
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
      token0Weight: 0.5021603278851686,
      token1Weight: 0.4978396721148313,
      token0UsdPrice: 0.9974859333615437,
      token1UsdPrice: 1.002548756845062,
    };

    expect(calculateTokenWeightsAndPricesFromLp(lp)).toEqual(expectedOutput);
  });

  it('should calculate token weights and prices correctly for non stablecoin pool', () => {
    const lp: UniswapPoolResponse = {
      id: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
      volumeToken0: '1802251.10802503',
      volumeToken1: '27129914.629287229175659917',
      volumeUSD: '50597612742.28561633897302055446347',
      totalValueLockedToken0: '1610.41444124',
      totalValueLockedToken1: '37055.500053437692003394',
      totalValueLockedUSD: '122529095.1539525547340794427372564',
      token0Price: '0.06310954796549371558565380658025073',
      token1Price: '15.84546288537461952666343446649126',
      liquidity: '896850668318377549',
      token0: {
        symbol: 'WBTC',
        id: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        decimals: '8',
        totalValueLocked: '6691.23888391',
        totalValueLockedUSD: '207867767.1186576316565615068810082',
      },
      token1: {
        symbol: 'WETH',
        id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        decimals: '18',
        totalValueLocked: '630726.384777363780874286',
        totalValueLockedUSD: '1234040311.269620718228815199386432',
      },
      poolDayData: [],
    };

    const expectedOutput = {
      token0Weight: 0.4078061669764292,
      token1Weight: 0.5921938330235709,
      token0UsdPrice: 31028.11261388633,
      token1UsdPrice: 1958.1701612848003,
    };

    expect(calculateTokenWeightsAndPricesFromLp(lp)).toEqual(expectedOutput);
  });
});
