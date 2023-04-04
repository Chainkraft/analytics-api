import { Contract, ethers } from 'ethers';

export interface LiquidityPoolHistory {
  dex: string;
  network: string;
  name: string;
  symbol: string;
  assetTypeName: string;
  address: string;
  pricingType: LiquidityPoolPricingType;
  balances: { coins: ICoinFromPoolDataApi[]; date: Date; block: number }[];
  underlyingBalances: { coins: ICoinFromPoolDataApi[]; date: Date; block: number }[];
  poolDayData: IPoolDayData[];
  isMetaPool: boolean;
  tvlUSD: number;
  volumeUSD: number;
  usdTotal: number;
  usdtotalExcludingBasePool: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export enum LiquidityPoolPricingType {
  USD = 'USD',
  RATIO = 'RATIO',
}

export enum SupportedDexes {
  CURVE = 'curve',
  UNISWAP = 'uniswap',
}

// This is from uniswap-v3 subgraph
export interface IPoolDayData {
  date: Date;
  tvlUSD: string;
  volumeToken0: string;
  volumeToken1: string;
  volumeUSD: string;
  token0Price: string;
  token1Price: string;
}

//This is done for recurring jobs:

export interface StablecoinLiquidityPoolSummary {
  tokenSymbol: string;
  tokenSlug: string;
  pools: ShortLiquidityPool[];
}

export interface ShortLiquidityPool {
  name: string;
  address: string;
  dex: string;
  symbol?: string;
  network?: string;
  tvl?: number;
  tokens?: string[];
}

// Everything below this comment is taken from curve-js lib

export interface IDict<T> {
  [index: string]: T;
}

export type INetworkName = 'ethereum' | 'polygon' | 'avalanche';

export type REFERENCE_ASSET = 'USD' | 'EUR' | 'BTC' | 'ETH' | 'LINK' | 'CRYPTO' | 'OTHER';

export interface IPoolData {
  name: string;
  full_name: string;
  symbol: string;
  reference_asset: REFERENCE_ASSET;
  swap_address: string;
  token_address: string;
  gauge_address: string;
  deposit_address?: string;
  sCurveRewards_address?: string;
  reward_contract?: string;
  is_plain?: boolean;
  is_lending?: boolean;
  is_meta?: boolean;
  is_crypto?: boolean;
  is_fake?: boolean;
  is_factory?: boolean;
  base_pool?: string;
  underlying_coins: string[];
  wrapped_coins: string[];
  underlying_coin_addresses: string[];
  wrapped_coin_addresses: string[];
  underlying_decimals: number[];
  wrapped_decimals: number[];
  use_lending?: boolean[];
  swap_abi: any;
  gauge_abi: any;
  deposit_abi?: any;
  sCurveRewards_abi?: any;
}

// export interface ICurve {
//   provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
//   multicallProvider: MulticallProvider;
//   signer: ethers.Signer | null;
//   signerAddress: string;
//   chainId: number;
//   contracts: { [index: string]: { contract: Contract; multicallContract: MulticallContract } };
//   feeData: { gasPrice?: number; maxFeePerGas?: number; maxPriorityFeePerGas?: number };
//   constantOptions: { gasLimit: number };
//   options: { gasPrice?: number | ethers.BigNumber; maxFeePerGas?: number | ethers.BigNumber; maxPriorityFeePerGas?: number | ethers.BigNumber };
//   constants: {
//     NATIVE_TOKEN: { symbol: string; wrappedSymbol: string; address: string; wrappedAddress: string };
//     NETWORK_NAME: INetworkName;
//     ALIASES: IDict<string>;
//     POOLS_DATA: IDict<IPoolData>;
//     FACTORY_POOLS_DATA: IDict<IPoolData>;
//     CRYPTO_FACTORY_POOLS_DATA: IDict<IPoolData>;
//     COINS: IDict<string>;
//     DECIMALS: IDict<number>;
//     GAUGES: string[];
//   };
//   setContract: (address: string, abi: any) => void;
// }

export interface ICoinFromPoolDataApi {
  address: string;
  symbol: string;
  decimals: string;
  usdPrice: number | string;
  price: string;
  // added by us
  poolBalance: string;
  weight: number;
}

export interface IReward {
  gaugeAddress: string;
  tokenAddress: string;
  symbol: string;
  apy: number;
}

export interface IRewardFromApi {
  gaugeAddress: string;
  tokenAddress: string;
  tokenPrice: number;
  name: string;
  symbol: string;
  decimals: number;
  apy: number;
}

export interface IPoolDataFromApi {
  id: string;
  name: string;
  symbol: string;
  assetTypeName: string;
  address: string;
  lpTokenAddress?: string;
  gaugeAddress?: string;
  implementation: string;
  implementationAddress: string;
  coins: ICoinFromPoolDataApi[];
  gaugeRewards: IRewardFromApi[];
  usdTotal: number;
  totalSupply: number;
  amplificationCoefficient: string;
  gaugeCrvApy: [number | null, number | null];

  // added by us
  usdtotalExcludingBasePool: number;
  isMetaPool: boolean;
  underlyingCoins: ICoinFromPoolDataApi[];
}

export interface ISubgraphPoolData {
  address: string;
  volumeUSD: number;
  latestDailyApy: number;
  latestWeeklyApy: number;
}

export interface IExtendedPoolDataFromApi {
  poolData: IPoolDataFromApi[];
  tvl?: number;
  tvlAll: number;
}

export interface IRouteStep {
  poolId: string;
  poolAddress: string;
  inputCoinAddress: string;
  outputCoinAddress: string;
  i: number;
  j: number;
  swapType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
  swapAddress: string; // for swapType == 4
}

export interface IRoute_ {
  steps: IRouteStep[];
  minTvl: number;
  totalTvl: number;
}

export interface IRoute {
  steps: IRouteStep[];
  _output: ethers.BigNumber;
  outputUsd: number;
  txCostUsd: number;
}

export interface IProfit {
  day: string;
  week: string;
  month: string;
  year: string;
  token: string;
  symbol: string;
  price: number;
}
