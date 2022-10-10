import { Document, model, Schema } from 'mongoose';
import { Contract } from '@interfaces/contracts.interface';

const contractMonitorLogSchema: Schema = new Schema({}, { strict: false });

const contractsMonitorLogModel = model<Contract & Document>('ContractMonitorLog', contractMonitorLogSchema);

export default contractsMonitorLogModel;
