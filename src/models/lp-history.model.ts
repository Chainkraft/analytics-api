import { Document, model, Schema } from 'mongoose';
import { LiquidityPoolHistory } from '@/interfaces/curve-interfaces';

const liquidityPoolHistorySchema: Schema = new Schema(
  {
    dex: String,
    name: String,
    symbol: String,
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
  },
  {
    timestamps: true,
  },
);

const liquidityPoolHistoryModel = model<LiquidityPoolHistory & Document>('LiquidityPoolHistory', liquidityPoolHistorySchema);

export default liquidityPoolHistoryModel;
