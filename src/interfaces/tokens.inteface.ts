import { Contract } from "@interfaces/contracts.interface";

export interface Token {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;

  symbol: string;

  current_price: number;
  atl: number;
  ath: number;
  price_change_24h: number;
  price_change_24h_percentage: number;

  current_market_cap: number;

  volume_24h: number;

  pegged: boolean;
  peggedAsset: string;
  pegMechanism: string;

  contracts: Contract[];

  // new
  twitter: string;
  audits: string[];
  chains: string[];

  // apis
  llama_id: string;
  gecko_id: string;

  updatedAt?: Date;
  createdAt?: Date;
}

export interface PriceHistory {
  token: string;
  slug: string;
  gecko_id: string;
  prices: { price: number; date: Date }[];
  updatedAt?: Date;
  createdAt?: Date;
}

export interface MarketCapHistory {
  token: string;
  slug: string;
  gecko_id: string;
  market_caps: { market_cap: number; date: Date }[];
  updatedAt?: Date;
  createdAt?: Date;
}
