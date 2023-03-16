import { Types } from 'mongoose';

export interface Project {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  url: string;
  logo: string;
}
