import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import BlockchainsController from '@controllers/blockchains.controller';

class ContractsRoute implements Routes {
  public path = '/blockchains';
  public router = Router();
  public blockchainController = new BlockchainsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/lastBlocks`, this.blockchainController.getLastBlocks);
  }
}

export default ContractsRoute;
