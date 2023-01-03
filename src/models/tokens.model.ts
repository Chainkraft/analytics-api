import mongoose, { Document, model, Schema } from 'mongoose';
import { Token } from '@interfaces/tokens.inteface';

const tokenSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    symbol: {
      type: String,
      required: true,
    },
    current_price: {
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
    price_change_24h: {
      type: Number,
      required: false,
    },
    price_change_24h_percentage: {
      type: Number,
      required: false,
    },
    current_market_cap: {
      type: Number,
      required: false,
    },
    volume_24h: {
      type: Number,
      required: false,
    },
    twitter: {
      type: String,
      required: false,
    },
    audits: {
      type: [String],
      required: false,
    },
    chains: {
      type: [String],
      required: false,
    },

    // apis
    llama_id: {
      type: String,
      required: false,
    },

    gecko_id: {
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
    pegMechanism: {
      type: String,
      required: false,
    },
    contracts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    }],
  },
  {
    timestamps: true,
  },
);

const tokenModel = model<Token & Document>('Token', tokenSchema);

export default tokenModel;
