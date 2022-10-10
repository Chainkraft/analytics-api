import { model, Schema, Document } from 'mongoose';
import { StablecoinPriceAlert } from '@/interfaces/alerts.interface';

const stablecoinPriceAlertSchema: Schema = new Schema(
  {
    tokens: [
      {
        price: Number,
        token: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const stablecoinPriceAlertModel = model<StablecoinPriceAlert & Document>('StablecoinPriceAlert', stablecoinPriceAlertSchema);

export default stablecoinPriceAlertModel;
