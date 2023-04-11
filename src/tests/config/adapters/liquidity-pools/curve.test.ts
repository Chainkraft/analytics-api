import { calculateCoinsWeights } from '../../../../config/adapters/liquidity-pools/curve/curve';
import { ICoinFromPoolDataApi } from '../../../../interfaces/liquidity-pool-history.interface';

describe('calculateCoinsWeights', () => {
  it('should calculate coin weights correctly', () => {
    const coins: ICoinFromPoolDataApi[] = [
      {
        address: '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
        usdPrice: 0.03359356866870624,
        decimals: '18',
        symbol: 'USDN',
        poolBalance: '4659493919217831134330586',
      },
      {
        address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
        usdPrice: 1.026171759137801,
        decimals: '18',
        symbol: '3Crv',
        poolBalance: '15279340440361807789469',
      },
    ];

    const totalBalance = 172208.2565948148;
    const expectedOutput = [
      {
        address: '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
        usdPrice: 0.03359356866870624,
        decimals: '18',
        symbol: 'USDN',
        poolBalance: '4659493919217831134330586',
        weight: 0.9089519401207182,
      },
      {
        address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
        usdPrice: 1.026171759137801,
        decimals: '18',
        symbol: '3Crv',
        poolBalance: '15279340440361807789469',
        weight: 0.0910480598792818,
      },
    ];
    expect(calculateCoinsWeights(coins, totalBalance)).toEqual(expectedOutput);
  });

  it('should return an empty array when given an empty array', () => {
    expect(calculateCoinsWeights([], 0)).toEqual([]);
  });
});
