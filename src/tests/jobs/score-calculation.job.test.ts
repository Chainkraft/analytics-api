import { Token, PriceHistory } from '../../interfaces/tokens.inteface';
import { Score } from '../../interfaces/scores.interface';
import mongoose from 'mongoose';

import { RefreshScoreJob } from '../../jobs/score-calculation.job';

const job = new RefreshScoreJob();

describe('calculateNewScores', () => {
  it('should return an empty Score object when given empty arrays', () => {
    const tokens: Token[] = [];
    const priceHistories: PriceHistory[] = [];
    const expected: Score = {
      chains: [],
      volumes: [],
      marketCaps: [],
      priceDeviations: [],
    };

    const result = job.calculateNewScores(tokens, priceHistories);
    expect(result).toEqual(expected);
  });

  it('should return a Score object with calculated values', () => {
    const tokens: Token[] = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Token1',
        slug: 'token1',
        description: 'Token 1 description',
        image: 'https://example.com/token1.png',
        symbol: 'TK1',
        current_price: 1.0,
        atl: 0.9,
        ath: 1.2,
        price_change_24h: 0.02,
        price_change_24h_percentage: 2,
        current_market_cap: 1000000,
        volume_24h: 50000,
        pegged: true,
        peggedAsset: 'USD',
        pegMechanism: 'Algorithmic',
        contracts: [],
        twitter: '@token1',
        audits: [],
        chains: ['chain1', 'chain2'],
        llama_id: '123',
        gecko_id: '456',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Token2',
        slug: 'token2',
        description: 'Token 2 description',
        image: 'https://example.com/token2.png',
        symbol: 'TK2',
        current_price: 1.01,
        atl: 0.95,
        ath: 1.1,
        price_change_24h: -0.01,
        price_change_24h_percentage: -1,
        current_market_cap: 2000000,
        volume_24h: 30000,
        pegged: true,
        peggedAsset: 'USD',
        pegMechanism: 'Collateralized',
        contracts: [],
        twitter: '@token2',
        audits: [],
        chains: ['chain1'],
        llama_id: '789',
        gecko_id: '012',
      },
    ];

    const priceHistories: PriceHistory[] = [
      {
        token: 'Token1',
        slug: 'token1',
        gecko_id: '456',
        prices: [
          { date: new Date('2023-04-23'), price: 0.99 },
          { date: new Date('2023-04-22'), price: 1.01 },
          { date: new Date('2023-04-21'), price: 0.98 },
        ],
      },
    ];

    const result = job.calculateNewScores(tokens, priceHistories);

    expect(result.chains).toEqual([1, 2]);
    expect(result.volumes).toEqual([30000, 50000]);
    expect(result.marketCaps).toEqual([1000000, 2000000]);
    expect(result.priceDeviations.length).toBe(1);
  });

  it('should return correct priceDeviations when priceHistories have all prices below peg', () => {
    const tokens: Token[] = []; // not needed for this test case

    const priceHistories: PriceHistory[] = [
      {
        token: 'Token1',
        slug: 'token1',
        gecko_id: '456',
        prices: [
          { date: new Date('2023-04-23'), price: 0.95 },
          { date: new Date('2023-04-22'), price: 0.96 },
          { date: new Date('2023-04-21'), price: 0.94 },
        ],
      },
    ];

    const result = job.calculateNewScores(tokens, priceHistories);

    expect(result.priceDeviations.length).toBe(1);

    // 0.06204836822995434
    expect(result.priceDeviations[0]).toBeCloseTo(0.062, 3);
  });

  it('should return correct priceDeviations when priceHistories have prices above and below peg', () => {
    const tokens: Token[] = []; // not needed for this test case

    const priceHistories: PriceHistory[] = [
      {
        token: 'Token1',
        slug: 'token1',
        gecko_id: '456',
        prices: [
          { date: new Date('2023-04-23'), price: 1.02 },
          { date: new Date('2023-04-22'), price: 0.98 },
          { date: new Date('2023-04-21'), price: 1.05 },
        ],
      },
    ];

    const result = job.calculateNewScores(tokens, priceHistories);

    expect(result.priceDeviations.length).toBe(1);
    expect(result.priceDeviations[0]).toBeCloseTo(0.0141, 4);
  });
});
