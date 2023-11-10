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
