import { Notification, TokenDepeg } from '../../interfaces/notifications.interface';
import { StablecoinAnomaliesJob } from '../../jobs/stablecoin-anomalies.job';
// import { TokenDepeg } from '../../jobs/stablecoin-anomalies.job';
import moment from 'moment';
import mongoose from 'mongoose';

const stablecoinsJob = new StablecoinAnomaliesJob();

describe('generateStablecoinNotifications', () => {
  const tokenDepegs: TokenDepeg[] = [
    {
      token: {
        // Populate with suitable token properties
        _id: new mongoose.Types.ObjectId('63908b26bf84f859cd117fd4'),
        slug: 'usd-coin',
        audits: ['https://www.centre.io/usdc-transparency'],
        chains: ['Ethereum'],
        createdAt: moment().toDate(),
        current_market_cap: 32666219266,
        current_price: 0.95,
        gecko_id: 'usd-coin',
        image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
        llama_id: '2',
        name: 'USD Coin',
        pegMechanism: 'fiat-backed',
        pegged: true,
        price_change_24h: -0.000567240379925504,
        symbol: 'USDC',
        updatedAt: moment().toDate(),
        volume_24h: 4558589792,
        description:
          'USDC is a fully regulated dollar digital stablecoin launched by Circle and Coinbase. USDC is fully backed by cash and short-dated U.S. government obligations, so that it is always redeemable 1:1 for U.S. dollars.',
        twitter: 'https://twitter.com/circlepay',
        contracts: [],

        atl: 0.9,
        ath: 1.1,
        price_change_24h_percentage: 5,
        peggedAsset: 'usd',
      },
      price: 0.95,
      avgPrice: 0.99,
      prices: [1],
      chains: ['chain1'],
    },
  ];

  const notifications: Notification[] = [
    // Your existing notifications here
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('detects stablecoin depeg and creates a new notification if this was not detected before', () => {
    const newNotifications = stablecoinsJob.genererateDepegNotifications(tokenDepegs, notifications);
    notifications.push(...newNotifications);

    expect(newNotifications.length).toBeGreaterThan(0);
  });

  it('does not create a new notification if it already exists', () => {
    const newNotifications = stablecoinsJob.genererateDepegNotifications(tokenDepegs, notifications);

    expect(newNotifications.length).toBe(0);
  });

  // Add more test cases as needed
});
