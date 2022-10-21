import { Contract } from '@interfaces/contracts.interface';
import { ObjectId } from 'mongoose';

export interface Project {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  url: string;
  logo: string;
  contracts: Contract[];
}
