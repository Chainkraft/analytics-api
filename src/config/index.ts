import { config } from 'dotenv';
import { init } from 'etherscan-api';
import { Alchemy, Network } from 'alchemy-sdk';
import { ContractNetwork } from '@interfaces/contracts.interface';
import axios from 'axios';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  HOST,
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  JWT_SECRET_KEY,
  JWT_EXPIRATION_TIME,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  ALCHEMY_NOTIFY_API_KEY,
} = process.env;

export const etherscans = new Map<ContractNetwork, any>([
  [
    ContractNetwork.ETH_MAINNET,
    new init(process.env.ETHERSCAN_API_KEY),
  ],
  [
    ContractNetwork.ETH_GOERLI,
    new init(process.env.ETHERSCAN_API_KEY, null, 10000, axios.create({
      baseURL: 'https://api-goerli.etherscan.io/',
      timeout: 10000,
    })),
  ],
]);

export const providers = new Map<ContractNetwork, Alchemy>([
  [
    ContractNetwork.ETH_MAINNET,
    new Alchemy({
      network: Network.ETH_MAINNET,
      apiKey: process.env.ALCHEMY_ETH_MAINNET_API_KEY,
    }),
  ],
  [
    ContractNetwork.ETH_GOERLI,
    new Alchemy({
      network: Network.ETH_GOERLI,
      apiKey: process.env.ALCHEMY_ETH_MAINNET_API_KEY,
    }),
  ],
]);
