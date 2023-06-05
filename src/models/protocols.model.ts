import mongoose, { Document, model, Schema } from 'mongoose';
import { Protocol } from '@interfaces/protocols.interface';
import { Token } from '@interfaces/tokens.inteface';
import { Contract } from '@interfaces/contracts.interface';

const protocolSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  homeUrl: { type: String },
  repositoryUrl: { type: String },
  token: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
  },
  contracts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
  ],
});

const protocolsModel = model<Protocol & Document>('Protocol', protocolSchema);

export default protocolsModel;
