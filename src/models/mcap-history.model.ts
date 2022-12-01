import { Document, model, Schema } from 'mongoose';
import { MarketCapHistory } from '@interfaces/tokens.inteface';

const marketCapHistorySchema: Schema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: false,
    },
    market_caps: [
      {
        market_cap: Number,
        date: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const marketCapHistoryModel = model<MarketCapHistory & Document>('MarketCapHistory', marketCapHistorySchema);

export default marketCapHistoryModel;
