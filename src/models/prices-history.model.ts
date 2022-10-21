import { model, Schema, Document } from 'mongoose';
import { PriceHistory } from '@interfaces/tokens.inteface';

const priceHistorySchema: Schema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    gecko_id: {
      type: String,
      required: false,
    },
    prices: [
      {
        price: Number,
        date: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const priceHistoryModel = model<PriceHistory & Document>('PriceHistory', priceHistorySchema);

export default priceHistoryModel;
