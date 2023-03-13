import mongoose, { Document, model, Schema } from 'mongoose';
import { Contract, ContractNetwork, ContractProxyType } from '@interfaces/contracts.interface';

const contractProxyHistorySchema: Schema = new Schema(
  {
    createdByArgs: String,
    createdByBlock: Number,
    createdByBlockAt: Date,
    createdByTxHash: String,
    createdByAddress: String,
    address: String,
  },
  { _id: false },
);

const contractProxySchema: Schema = new Schema(
  {
    type: { type: String, enum: ContractProxyType, default: ContractProxyType.Unknown },
    implSlot: String,
    adminSlot: String,
    implHistory: [contractProxyHistorySchema],
    adminHistory: [contractProxyHistorySchema],
  },
  { _id: false },
);

const contractSchema: Schema = new Schema(
  {
    address: { type: String, required: true, lowercase: true },
    network: { type: String, required: true, enum: ContractNetwork },
    byteCode: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

    createdByArgs: { type: String },
    createdByBlock: { type: Number, required: true },
    createdByBlockAt: { type: Date, required: true },
    createdByTxHash: { type: String, required: true },
    createdByAddress: { type: String, required: true },

    verified: Boolean,
    verifiedAbi: String,
    verifiedName: String,
    verifiedSourceCode: String,
    verifiedCompilerVersion: String,

    proxy: contractProxySchema,
  },
  {
    timestamps: true,
  },
);

contractSchema.index({ address: 1, network: -1 }, { unique: true });
const contractsModel = model<Contract & Document>('Contract', contractSchema);

export default contractsModel;
