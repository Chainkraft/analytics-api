import { Document, model, Schema } from 'mongoose';
import { LiquidityPoolHistory } from '@/interfaces/liquidity-pool-history.interface';

const liquidityPoolHistorySchema: Schema = new Schema(
  {
    dex: String,
    network: String,
    name: String,
    symbol: String,
    assetTypeName: String,
    address: String,
    pricingType: String,
    balances: [
      {
        coins: [
          {
            address: String,
            symbol: String,
            decimals: String,
            usdPrice: Number,
            price: Number,
            // added by us
            poolBalance: String,
            weight: Number,
          },
        ],
        date: Date,
        block: Number,
      },
    ],
    underlyingBalances: [
      {
        coins: [
          {
            address: String,
            symbol: String,
            decimals: String,
            usdPrice: Number,
            price: Number,
            // added by us
            poolBalance: String,
            weight: Number,
          },
        ],
        date: Date,
        block: Number,
      },
    ],
    poolDayData: [
      {
        date: Date,
        tvlUSD: Number,
        volumeToken0: Number,
        volumeToken1: Number,
        volumeUSD: Number,
        token0Price: Number,
        token1Price: Number,
      },
    ],
    tvlUSD: Number,
    volumeUSD: Number,
    isMetaPool: Boolean,
    usdTotal: Number,
    usdtotalExcludingBasePool: Number,
  },
  {
    timestamps: true,
  },
);

const liquidityPoolHistoryModel = model<LiquidityPoolHistory & Document>('LiquidityPoolHistory', liquidityPoolHistorySchema);

export default liquidityPoolHistoryModel;
