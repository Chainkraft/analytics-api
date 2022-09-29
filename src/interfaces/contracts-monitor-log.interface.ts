import { ContractNetwork } from '@interfaces/contracts.interface';

export interface ContractMonitorLog {
  hash: string,
  fromAddress: string,
  toAddress: string,
  blockNum: number,
  network: ContractNetwork,
  raw: Object,
}
