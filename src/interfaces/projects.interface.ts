import {Contract} from "@interfaces/contracts.interface";

export interface Project {
  name: string;
  description: string;
  url: string;
  logo: string;
  contracts: Contract[];
}
