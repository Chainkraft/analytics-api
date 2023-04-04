import moment from 'moment';
import { LiquidityPoolHistory, LiquidityPoolPricingType } from '../../interfaces/liquidity-pool-history.interface';
import { Notification, NotificationSeverity, NotificationType } from '../../interfaces/notifications.interface';
import { PoolsCompositionNotificationsJob } from '../../jobs/pools-composition.job';

// This is not needed as of now, but probably will be.
jest.mock('../../services/notifications.service', () => {
  return jest.fn().mockImplementation(() => {
    return {
      createNotification: jest.fn().mockResolvedValue({
        _id: 'mocked-notification-id',
        type: NotificationType.LP_COMPOSITION_CHANGE,
        severity: NotificationSeverity.CRITICAL,
        data: {
          token: 'MOCK',
          weight: 0.2,
          balance: 1000,
          date: new Date('2023-01-01T00:00:00.000Z'),
        },
      }),
    };
  });
});

const poolsJob = new PoolsCompositionNotificationsJob();

describe('detectWeightChangeInPool', () => {
  const poolHistory: LiquidityPoolHistory = {
    dex: 'curve',
    network: 'ethereum',
    name: '',
    symbol: '',
    assetTypeName: '',
    address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
    pricingType: LiquidityPoolPricingType.USD,
    balances: [
      {
        coins: [
          {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            decimals: '18',
            usdPrice: 1.001,
            price: '1',
            weight: 0.35,
            poolBalance: '165380350622839514039437569',
          },
          {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            decimals: '6',
            usdPrice: 1,
            price: '1',
            weight: 0.35,
            poolBalance: '162414327217796',
          },
          {
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            symbol: 'USDT',
            decimals: '6',
            usdPrice: 1,
            price: '1',
            weight: 0.3,
            poolBalance: '281096827003352',
          },
        ],
        date: moment().utc().subtract(12, 'hours').toDate(),
        block: 100,
      },
      {
        coins: [
          {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            decimals: '18',
            usdPrice: 1.001,
            price: '1',
            weight: 0.8,
            poolBalance: '165380350622839514039437569',
          },
          {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            symbol: 'USDC',
            decimals: '6',
            usdPrice: 1,
            price: '1',
            weight: 0.1,
            poolBalance: '162414327217796',
          },
          {
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            symbol: 'USDT',
            decimals: '6',
            usdPrice: 1,
            price: '1',
            weight: 0.1,
            poolBalance: '281096827003352',
          },
        ],
        date: moment().utc().subtract(4, 'hours').toDate(),
        block: 100,
      },
    ],
    underlyingBalances: [],
    poolDayData: [],
    isMetaPool: false,
    tvlUSD: 0,
    volumeUSD: 0,
    usdTotal: 0,
    usdtotalExcludingBasePool: 0,
  };

  const notifications: Notification[] = [
    // Your existing notifications here
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('detects weight change and creates a new notification if not exists', () => {
    const newNotifications = poolsJob.detectWeightChangeInPool(poolHistory, notifications);
    notifications.push(...newNotifications);

    expect(newNotifications.length).toBeGreaterThan(0);
  });

  it('does not create a new notification if it already exists', () => {
    const newNotifications = poolsJob.detectWeightChangeInPool(poolHistory, notifications);

    expect(newNotifications.length).toBe(0);
  });

  it('does not create a new notification if weight change is too small', () => {
    const extendedPoolHistory = poolHistory;
    extendedPoolHistory.balances.push({
      coins: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          decimals: '18',
          usdPrice: 1.001,
          price: '1',
          weight: 0.74,
          poolBalance: '165380350622839514039437569',
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          decimals: '6',
          usdPrice: 1,
          price: '1',
          weight: 0.13,
          poolBalance: '162414327217796',
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          decimals: '6',
          usdPrice: 1,
          price: '1',
          weight: 0.13,
          poolBalance: '281096827003352',
        },
      ],
      date: moment().utc().subtract(1, 'hours').toDate(),
      block: 100,
    });
    const newNotifications = poolsJob.detectWeightChangeInPool(extendedPoolHistory, notifications);

    expect(newNotifications.length).toBe(0);
  });
  // Add more test cases as needed
});
