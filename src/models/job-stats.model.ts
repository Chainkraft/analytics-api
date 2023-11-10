import { model, Schema } from 'mongoose';
import { GlobalStats } from '@interfaces/jobs-stats.interface';

const globalStatsSchema: Schema = new Schema({
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
    min: 0,
    max: 12,
  },
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  activeCryptocurrencies: {
    type: Number,
    required: true,
  },
  totalMarketCap: {
    type: Number,
    required: true,
  },
  totalVolume: {
    type: Number,
    required: true,
  },
  marketCapPercentage: {
    type: Map,
    of: String,
    required: true,
  },
  marketCapPercentageChange24h: {
    type: Number,
    required: true,
  },
});

export const globalStatsModel = model<GlobalStats>('GlobalStats', globalStatsSchema);
