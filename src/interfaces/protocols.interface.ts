import { Types } from 'mongoose';
import { Token } from '@interfaces/tokens.inteface';
import { Contract } from '@interfaces/contracts.interface';

export interface Protocol {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  homeUrl: string;
  repositoryUrl: string;
  token?: Token;
  contracts: Contract[];
}
