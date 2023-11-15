export interface GlobalStats {
  _id: string;
  year: number;
  month: number;
  day: number;
  activeCryptocurrencies: number;
  totalMarketCap: number;
  totalVolume: number;
  marketCapPercentage: Map<string, number>;
  marketCapPercentageChange24h: number;
}

export interface LlamaStablecoinsResponse {
  date: string;
  totalCirculatingUSD: Record<string, number>;
}

export interface StablecoinsStats {
  _id: string;
  year: number;
  month: number;
  day: number;
  totalMarketCapUSD: number;
  // marketCapPercentageChange24h: number;
}
