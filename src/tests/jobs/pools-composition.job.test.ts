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
function create3PoolHistory(): LiquidityPoolHistory {
  return {
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
    tvlUSD: 25_000_000,
    volumeUSD: 0,
    usdTotal: 0,
    usdtotalExcludingBasePool: 0,
  };
}

function createWethDaiPoolHistory(): LiquidityPoolHistory {
  return {
    dex: 'uniswap',
    network: 'ethereum',
    name: '',
    symbol: '',
    assetTypeName: '',
    address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    pricingType: LiquidityPoolPricingType.USD,
    balances: [
      {
        coins: [
          {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            symbol: 'WETH',
            decimals: '18',
            usdPrice: 3200,
            price: '1',
            weight: 0.8,
            poolBalance: '4800000000000000000000',
          },
          {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            decimals: '18',
            usdPrice: 1.001,
            price: '1',
            weight: 0.4,
            poolBalance: '11000000000000000000000',
          },
        ],
        date: moment().utc().subtract(12, 'hours').toDate(),
        block: 200,
      },
      {
        coins: [
          {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            symbol: 'WETH',
            decimals: '18',
            usdPrice: 3200,
            price: '1',
            weight: 0.45,
            poolBalance: '4800000000000000000000',
          },
          {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            symbol: 'DAI',
            decimals: '18',
            usdPrice: 1.001,
            price: '1',
            weight: 0.4,
            poolBalance: '11000000000000000000000',
          },
        ],
        date: moment().utc().subtract(8, 'hours').toDate(),
        block: 200,
      },
    ],
    underlyingBalances: [],
    poolDayData: [],
    isMetaPool: false,
    tvlUSD: 25_000_000,
    volumeUSD: 0,
    usdTotal: 0,
    usdtotalExcludingBasePool: 0,
  };
}

function createDaiUSDCPoolHistory(): LiquidityPoolHistory {
  return {
    dex: 'uniswap',
    network: 'ethereum',
    name: '',
    symbol: '',
    assetTypeName: '',
    address: '0x6c6bc977e13df9b0de53b251522280bb72383700',
    pricingType: LiquidityPoolPricingType.USD,
    balances: [
      {
        coins: [
          {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            symbol: 'DAI',
            decimals: '0',
            usdPrice: 0.9999999999999999,
            price: '0.9996044099753641',
            poolBalance: '33291227.008911564692562425',
            weight: 0.50351649757579,
          },
          {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            decimals: '0',
            usdPrice: 0.9996044099753641,
            price: '1.0003957465780344',
            poolBalance: '32826223.301444',
            weight: 0.49628709850325475,
          },
        ],
        block: 100,
        date: moment().utc().subtract(12, 'hours').toDate(),
      },
      {
        coins: [
          {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            symbol: 'DAI',
            decimals: '0',
            usdPrice: 1,
            price: '0.9996135418212994',
            poolBalance: '33575337.103591904168077788',
            weight: 0.5078130090150986,
          },
          {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            decimals: '0',
            usdPrice: 0.9996135418212994,
            price: '1.0003866075863643',
            poolBalance: '32542183.533997',
            weight: 0.49199678129678515,
          },
        ],
        block: 110,
        date: moment().utc().subtract(4, 'hours').toDate(),
      },
    ],
    underlyingBalances: [],
    poolDayData: [],
    isMetaPool: false,
    tvlUSD: 25_000_000,
    volumeUSD: 0,
    usdTotal: 0,
    usdtotalExcludingBasePool: 0,
  };
}

describe('detectWeightChangeInPool', () => {
  const notifications: Notification[] = [];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('detects weight change and creates a new notification if not exists', () => {
    const poolHistory = create3PoolHistory();
    const newNotifications = poolsJob.detectWeightChangeInPool(poolHistory, notifications);
    notifications.push(...newNotifications);

    expect(newNotifications.length).toBeGreaterThan(0);
  });

  it('does not create a new notification if it already exists', () => {
    const newNotifications = poolsJob.detectWeightChangeInPool(create3PoolHistory(), notifications);

    expect(newNotifications.length).toBe(0);
  });

  it('does not create a new notification if weight change is too small', () => {
    const poolHistory = create3PoolHistory();
    poolHistory.balances.push({
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
    const newNotifications = poolsJob.detectWeightChangeInPool(poolHistory, notifications);
    expect(newNotifications.length).toBe(0);

    poolHistory.balances.pop();
  });

  it('does not create a new notification if pool tvlUSD is less than 1000000', () => {
    const lowTvlPoolHistory = { ...create3PoolHistory(), tvlUSD: 900_000 };
    const newNotifications = poolsJob.detectWeightChangeInPool(lowTvlPoolHistory, notifications);

    expect(newNotifications.length).toBe(0);
  });

  it('creates a new notification when pool tvlUSD is between 1000000 and 10000000 and weight change is at least 0.3', () => {
    const midTvlPoolHistory = { ...create3PoolHistory(), address: '0xtest', tvlUSD: 5_000_000 };
    const newNotifications = poolsJob.detectWeightChangeInPool(midTvlPoolHistory, []);

    expect(newNotifications.length).toBeGreaterThan(0);
    expect(newNotifications[0].data.weightChange).toBeGreaterThanOrEqual(0.3);
  });

  it('does not create a new notification if pool tvlUSD is more than 10000000 and weight change is less than 0.2', () => {
    const highTvlPoolHistory = { ...create3PoolHistory(), tvlUSD: 12_000_000 };
    highTvlPoolHistory.balances[1].coins[0].weight = 0.4;
    highTvlPoolHistory.balances[1].coins[1].weight = 0.4;
    highTvlPoolHistory.balances[1].coins[2].weight = 0.4;
    const newNotifications = poolsJob.detectWeightChangeInPool(highTvlPoolHistory, []);

    expect(newNotifications.length).toBe(0);
  });

  it('creates notifcations based on the last created notification', () => {
    const poolHistoryWethDai = createWethDaiPoolHistory();
    const newNotifications = poolsJob.detectWeightChangeInPool(poolHistoryWethDai, []);
    poolHistoryWethDai.balances.push({
      coins: [
        {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'WETH',
          decimals: '18',
          usdPrice: 3200,
          price: '1',
          weight: 0.15,
          poolBalance: '4800000000000000000000',
        },
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          decimals: '18',
          usdPrice: 1.001,
          price: '1',
          weight: 0.4,
          poolBalance: '11000000000000000000000',
        },
      ],
      date: moment().utc().subtract(2, 'hours').toDate(),
      block: 100,
    });

    expect(newNotifications.length).toBeGreaterThan(0);

    const newerNotifications = poolsJob.detectWeightChangeInPool(poolHistoryWethDai, newNotifications);
    expect(newerNotifications.length).toBeGreaterThan(0);
  });

  it('Create a notification and create the next one based on this one v2', () => {
    const poolHistory = create3PoolHistory();
    const newNotifications = poolsJob.detectWeightChangeInPool(poolHistory, []);

    expect(newNotifications.length).toBeGreaterThan(0);

    poolHistory.balances.push({
      coins: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          decimals: '18',
          usdPrice: 1.001,
          price: '1',
          weight: 0.48,
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
      date: moment().utc().subtract(2, 'hours').toDate(),
      block: 100,
    });

    const newerNotifications = poolsJob.detectWeightChangeInPool(poolHistory, newNotifications);
    expect(newerNotifications.length).toBeGreaterThan(0);
  });

  it('Should create a single notification per coin when two anomalies detected', () => {
    const poolHistory = create3PoolHistory();
    poolHistory.balances.push({
      coins: [
        {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          decimals: '18',
          usdPrice: 1.001,
          price: '1',
          weight: 0.5,
          poolBalance: '165380350622839514039437569',
        },
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          decimals: '6',
          usdPrice: 1,
          price: '1',
          weight: 0.7,
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
      date: moment().utc().subtract(2, 'hours').toDate(),
      block: 100,
    });

    const newNotifications = poolsJob.detectWeightChangeInPool(poolHistory, []);
    expect(newNotifications.length).toBe(2);
  });

  it('Should create a notification when the one from other pool has been created', () => {
    const triPoolHistory = create3PoolHistory();
    const notifications3Pool = poolsJob.detectWeightChangeInPool(triPoolHistory, []);

    const poolHistoryWethDai = createWethDaiPoolHistory();
    const notificationsWethDai = poolsJob.detectWeightChangeInPool(poolHistoryWethDai, notifications3Pool);

    expect(notificationsWethDai.length).toBe(1);
  });

  it('Should not create a notification when the one has been created before', () => {
    const daiUsdcHistory = createDaiUSDCPoolHistory();

    const usdcNotification: Notification = {
      type: NotificationType.LP_COMPOSITION_CHANGE,
      severity: NotificationSeverity.CRITICAL,
      data: {
        token: 'USDC',
        weight: 0.49628709850325475,
        weightChange: -0.23535780008057766,
        balance: 32826223.301444,
        date: moment().utc().subtract(12, 'hours').toDate(),
      },
      liquidityPool: daiUsdcHistory,
      createdAt: moment().utc().subtract(12, 'hours').add(10, 'minutes').toDate(),
      updatedAt: moment().utc().subtract(12, 'hours').add(10, 'minutes').toDate(),
    };

    const newNotifications = poolsJob.detectWeightChangeInPool(daiUsdcHistory, [usdcNotification]);
    expect(newNotifications.length).toBe(0);
  });
});
