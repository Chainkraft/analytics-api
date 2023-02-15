import { ContractNetwork, ContractProxyType } from '@interfaces/contracts.interface';

export interface TokenContractSummary {
  slug: string;
  network: ContractNetwork;
  proxyPattern: {
    status: TokenContractSummaryStatus;
    type?: ContractProxyType;
    implSlot?: string;
    adminSlot?: string;
    address?: string;
  };
  sourceCode: {
    status: TokenContractSummaryStatus;
    size?: number;
    createdByBlock?: number;
    createdByAddress?: string;
    compilerVersion?: string;
  };
  proofOfTime: {
    status: TokenContractSummaryStatus;
    createdByBlock?: number;
    createdByBlockAt?: Date;
    updatedByBlock?: number;
    updatedByBlockAt?: Date;
  };
}

export enum TokenContractSummaryStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  ALARM = 'ALARM'
}
