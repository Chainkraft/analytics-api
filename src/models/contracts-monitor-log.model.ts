import { Document, model, Schema } from 'mongoose';
import { Contract, ContractNetwork } from '@interfaces/contracts.interface';

const contractMonitorLogSchema: Schema = new Schema({
  hash: { type: String, required: true, lowercase: true, unique: true },
  fromAddress: { type: String, required: true, lowercase: true },
  toAddress: { type: String, required: true, lowercase: true },
  blockNum: { type: Number, required: true },
  network: { type: String, required: true, enum: ContractNetwork },
  raw: Object,
});

const contractsMonitorLogModel = model<Contract & Document>('ContractMonitorLog', contractMonitorLogSchema);

export default contractsMonitorLogModel;
