import { Document, model, Schema } from 'mongoose';
import { Score } from '@/interfaces/scores.interface';

const scoreSchema: Schema = new Schema(
  {
    chains: {
      type: [Number],
      required: false,
    },
    volumes: {
      type: [Number],
      required: false,
    },
    marketCaps: {
      type: [Number],
      required: false,
    },
    priceDeviations: {
      type: [Number],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const scoreModel = model<Score & Document>('Score', scoreSchema);

export default scoreModel;
