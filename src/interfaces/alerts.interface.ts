export interface StablecoinPriceAlert {
  tokens: { price: number; token: string }[];
  updatedAt?: Date;
  createdAt?: Date;
}
