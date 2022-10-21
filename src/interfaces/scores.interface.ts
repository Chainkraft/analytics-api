export interface Score {
  chains: number[];
  volumes: number[];
  marketCaps: number[];
  priceDeviations: number[];

  updatedAt?: Date;
  createdAt?: Date;
}
