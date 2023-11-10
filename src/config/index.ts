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
  LOG_LOKI_HOST,
  ORIGIN,
  ALCHEMY_NOTIFY_API_KEY,
  COINGECKO_DEMO_API_KEY,
  CRYPTOSTATS_APP_KEY,
  CRYPTOSTATS_APP_SECRET,
  CRYPTOSTATS_ACCESS_TOKEN,
  CRYPTOSTATS_ACCESS_SECRET,
} = process.env;

export const etherscans = new Map<ContractNetwork, any>([
  [ContractNetwork.ETH_MAINNET, new init(process.env.ETHERSCAN_API_KEY)],
  [
    ContractNetwork.ETH_GOERLI,
    new init(
      process.env.ETHERSCAN_API_KEY,
      null,
      10000,
      axios.create({
        baseURL: 'https://api-goerli.etherscan.io',
        timeout: 10000,
      }),
    ),
  ],
  [
    ContractNetwork.OPT_MAINNET,
    new init(
      process.env.OPTSCAN_API_KEY,
      null,
      10000,
      axios.create({
        baseURL: 'https://api-optimistic.etherscan.io',
        timeout: 10000,
      }),
    ),
  ],
  [
    ContractNetwork.ARB_MAINNET,
    new init(
      process.env.ARBSCAN_API_KEY,
      null,
      10000,
      axios.create({
        baseURL: 'https://api.arbiscan.io',
        timeout: 10000,
      }),
    ),
  ],
  [
    ContractNetwork.MATIC_MAINNET,
    new init(
      process.env.MATICSCAN_API_KEY,
      null,
      10000,
      axios.create({
        baseURL: 'https://api.polygonscan.com',
        timeout: 10000,
      }),
    ),
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
  [
    ContractNetwork.OPT_MAINNET,
    new Alchemy({
      network: Network.OPT_MAINNET,
      apiKey: process.env.ALCHEMY_OPT_MAINNET_API_KEY,
    }),
  ],
  [
    ContractNetwork.ARB_MAINNET,
    new Alchemy({
      network: Network.ARB_MAINNET,
      apiKey: process.env.ALCHEMY_ARB_MAINNET_API_KEY,
    }),
  ],
  [
    ContractNetwork.MATIC_MAINNET,
    new Alchemy({
      network: Network.MATIC_MAINNET,
      apiKey: process.env.ALCHEMY_MATIC_MAINNET_API_KEY,
    }),
  ],
]);
