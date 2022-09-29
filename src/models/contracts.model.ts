import mongoose, {Document, model, Schema} from 'mongoose';
import {Contract, ContractNetwork, ContractProxyType} from '@interfaces/contracts.interface';

const contractProxyHistorySchema: Schema = new Schema({
  createdByArgs: String,
  createdByBlock: Number,
  createdByTxHash: String,
  createdByAddress: String,
  newAddress: String
});

const contractProxySchema: Schema = new Schema({
  type: {type: String, enum: ContractProxyType, default: ContractProxyType.Unknown},
  implSlot: String,
  adminSlot: String,
  implHistory: [contractProxyHistorySchema],
  adminHistory: [contractProxyHistorySchema]
});

const contractSchema: Schema = new Schema({
  address: {type: String, required: true, lowercase: true, unique: true},
  network: {type: String, enum: ContractNetwork},
  byteCode: {type: String, required: true},
  group: {type: mongoose.Schema.Types.ObjectId, ref: 'ContractGroup'},

  createdByArgs: {type: String},
  createdByBlock: {type: Number, required: true},
  createdByTxHash: {type: String, required: true},
  createdByAddress: {type: String, required: true},

  verified: Boolean,
  verifiedAbi: String,
  verifiedName: String,
  verifiedSourceCode: String,
  verifiedCompilerVersion: String,

  proxy: contractProxySchema
});

const contractsModel = model<Contract & Document>('Contract', contractSchema);

export default contractsModel;
