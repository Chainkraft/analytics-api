export interface Token {
  address: string;
  name: string;
  symbol: string;
  description: string;
  current_price: number;
  prices: [{ price: number; date: Date }];
  price_change_24h_usd: number;
  market_cap: number;
  atl: number;
  ath: number;
  updatedAt: Date;
  pegged: boolean;
  peggedAsset: string;
}
