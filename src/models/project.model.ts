import mongoose, { Document, model, Schema } from 'mongoose';
import { Project } from '@interfaces/projects.interface';

const projectSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  url: { type: String },
  logo: { type: String },
  contracts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contract' }],
});

const projectModel = model<Project & Document>('Project', projectSchema);

export default projectModel;
