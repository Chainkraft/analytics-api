import { Project } from '@interfaces/projects.interface';

export interface Contract {
  createdAt?: Date;
  updatedAt?: Date;

  address: string;
  network: ContractNetwork;
  byteCode: string;
  project?: Project;

  createdByArgs: string;
  createdByBlock: number;
  createdByTxHash: string;
  createdByAddress: string;

  verified: boolean;
  verifiedAbi: string;
  verifiedName: string;
  verifiedSourceCode: string;
  verifiedCompilerVersion: string;

  proxy: ContractProxy;
}

export interface ContractProxy {
  type: ContractProxyType;
  implSlot: string;
  adminSlot: string;
  implHistory: ContractProxyHistory[];
  adminHistory: ContractProxyHistory[];
}

export interface ContractProxyHistory {
  createdByArgs?: string;
  createdByBlock?: number;
  createdByTxHash?: string;
  createdByAddress?: string;
  address: string;
}

export enum ContractNetwork {
  ETH_MAINNET = 'eth-mainnet',
  ETH_GOERLI = 'eth-goerli'
}

export enum ContractProxyType {
  EIP1967 = 'eip1967.proxy.implementation',
  EIP1967Beacon = 'eip1967.proxy.beacon',
  EIP1822 = 'eip1822.uups.proxable',
  Zeppelin = 'org.zeppelinos.proxy.implementation',
  Unknown = '',
}
