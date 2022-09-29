import {config} from 'dotenv';
import {init} from "etherscan-api";
import {Alchemy, Network} from "alchemy-sdk";
import {ContractNetwork} from "@interfaces/contracts.interface";

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  ALCHEMY_NOTIFY_API_KEY
} = process.env;

export const etherscanApi = new init(process.env.ETHERSCAN_API_KEY);

export const providers = new Map<ContractNetwork, Alchemy>([
  [ContractNetwork.ETH_MAINNET, new Alchemy({
    network: Network.ETH_MAINNET,
    apiKey: process.env.ALCHEMY_ETH_MAINNET_API_KEY
  })]
]);
