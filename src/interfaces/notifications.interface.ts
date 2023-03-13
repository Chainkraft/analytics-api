import { Token } from '@interfaces/tokens.inteface';
import { Contract } from '@interfaces/contracts.interface';
import { User } from '@interfaces/users.interface';

export interface Notification {
  type: NotificationType;
  severity: NotificationSeverity;
  data?: NotificationStablecoinDepegDataSchema | NotificationContractChangeDataSchema | any;

  user?: User;
  token?: Token;
  contract?: Contract;

  updatedAt?: Date;
  createdAt?: Date;
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
}

export interface NotificationStablecoinDepegDataSchema {
  price: number;
  avgPrice: number;
  prices: number[];
  chains: string[];
}

export interface NotificationContractChangeDataSchema {
  oldAddress: string;
  newAddress: string;
}
