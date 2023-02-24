import { Document, model, Schema } from 'mongoose';
import { AccessRequest } from '@interfaces/subscribers.interface';

const accessRequestSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const subscribersModel = model<AccessRequest & Document>('AccessRequest', accessRequestSchema);

export default subscribersModel;
