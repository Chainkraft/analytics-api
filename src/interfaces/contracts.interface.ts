import { Types } from 'mongoose';

export interface Contract {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  address: string;
  network: ContractNetwork;
  byteCode: string;

  createdByArgs: string;
  createdByBlock: number;
  createdByBlockAt: Date;
  createdByTxHash: string;
  createdByAddress: string;

  verified: boolean;
  verifiedAbi: string;
  verifiedName: string;
  verifiedSourceCode: string;
  verifiedCompilerVersion: string;

  proxy?: ContractProxy;
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
  createdByBlockAt?: Date;
  createdByTxHash?: string;
  createdByAddress?: string;
  address: string;
}

export enum ContractNetwork {
  ETH_MAINNET = 'eth-mainnet',
  ETH_GOERLI = 'eth-goerli',
  // OPT_MAINNET = 'opt-mainnet',
  // OPT_GOERLI = "opt-goerli",
  // ARB_MAINNET = "arb-mainnet",
  // ARB_GOERLI = "arb-goerli",
  // MATIC_MAINNET = "polygon-mainnet",
  // MATIC_MUMBAI = "polygon-mumbai",
}

export enum ContractProxyType {
  EIP1967 = 'eip1967.proxy.implementation',
  EIP1967Beacon = 'eip1967.proxy.beacon',
  EIP1822 = 'eip1822.uups.proxable',
  Zeppelin = 'org.zeppelinos.proxy.implementation',
  Unknown = '',
}

export const mapGeckoNetwork = (network: string) => {
  switch (network) {
    case 'ethereum':
      return ContractNetwork.ETH_MAINNET;
    default:
      return undefined;
  }
};
