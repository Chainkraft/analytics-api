import { StablecoinsStats } from '@/interfaces/jobs-stats.interface';
import { model, Schema } from 'mongoose';

const stablecoinsStatsSchema: Schema = new Schema({
  _id: {
    type: String,
    validate: /^\d{4}-\d{2}-\d{2}$/,
  },
  year: {
    type: Number,
    required: true,
    min: 2015,
    max: 2100,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  totalMarketCapUSD: {
    type: Number,
    required: true,
  },
  marketCapPercentageChange24h: {
    type: Number,
    required: false,
  },
});

export const stablecoinsStatsModel = model<StablecoinsStats>('StablecoinsStats', stablecoinsStatsSchema);
