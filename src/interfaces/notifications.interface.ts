import { Token } from '@interfaces/tokens.inteface';
import { Contract, ContractNetwork } from '@interfaces/contracts.interface';
import { User } from '@interfaces/users.interface';
import { LiquidityPoolHistory } from './liquidity-pool-history.interface';

export interface Notification {
  type: NotificationType;
  severity: NotificationSeverity;
  data?: NotificationStablecoinDepegDataSchema | NotificationContractChangeDataSchema | NotificationLiquidityPoolCompositionChangeDataSchema | any;

  user?: User;
  token?: Token;
  contract?: Contract;
  liquidityPool?: LiquidityPoolHistory;

  updatedAt?: Date;
  createdAt?: Date;
}

export interface NotificationSubscription {
  user: User;
  token: Token;
}

export enum NotificationSeverity {
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
}

export enum NotificationType {
  STABLECOIN_DEPEG = 'STABLECOIN_DEPEG',
  CONTRACT_PROXY_IMPL_CHANGE = 'CONTRACT_PROXY_IMPL_CHANGE',
  CONTRACT_PROXY_ADMIN_CHANGE = 'CONTRACT_PROXY_ADMIN_CHANGE',
  LP_COMPOSITION_CHANGE = 'LP_COMPOSITION_CHANGE',
}

export interface NotificationLiquidityPoolCompositionChangeDataSchema {
  token: string;
  weight: number;
  weightChange: number;
  balance: number;
  date: Date;
}

export interface NotificationStablecoinDepegDataSchema {
  price: number;
  avgPrice: number;
  prices: number[];
  chains: string[];
}

export interface NotificationContractChangeDataSchema {
  network: ContractNetwork;
  oldAddress: string;
  newAddress: string;
}

// moved here because of tests
export interface TokenDepeg extends NotificationStablecoinDepegDataSchema {
  token: Token;
}
