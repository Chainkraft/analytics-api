import { model, Schema, Document } from 'mongoose';
import { Token } from '@interfaces/tokens.inteface';

const tokenSchema: Schema = new Schema(
  {
    address: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    symbol: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    current_price: {
      type: Number,
      required: false,
    },
    price_change_24h_usd: {
      type: Number,
      required: false,
    },
    prices: [
      {
        price: Number,
        date: Date,
      },
    ],
    market_cap: {
      type: Number,
      required: false,
    },
    atl: {
      type: Number,
      required: false,
    },
    ath: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    pegged: {
      type: Boolean,
      required: false,
    },
    peggedAsset: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const tokenModel = model<Token & Document>('Token', tokenSchema);

export default tokenModel;
