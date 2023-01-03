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
    balances: [
      {
        coins: [
          {
            address: String,
            symbol: String,
            decimals: String,
            usdPrice: Number,
            // added by us
            poolBalance: String,
          },
        ],
        date: Date,
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
            // added by us
            poolBalance: String,
          },
        ],
        date: Date,
      },
    ],
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
