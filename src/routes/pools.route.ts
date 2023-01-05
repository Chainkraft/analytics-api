import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import LiquidityPoolsController from '@/controllers/liquidity-pools.controller';

class LiquidityPoolsRoute implements Routes {
  public path = '/pools';
  public router = Router();
  public poolsController = new LiquidityPoolsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/dex/:dex`, this.poolsController.getLiquidityPoolsByDex);
    this.router.get(`${this.path}/dex/:dex/:symbol`, this.poolsController.getLiquidityPoolHistoryDetailsBySymbol);
    this.router.get(`${this.path}/:network/dex/:dex`, this.poolsController.getLiquidityPoolsByDex);
    this.router.get(`${this.path}/:network/address/:address`, this.poolsController.getLiquidityPoolHistoryDetailsByAddress);
  }
}

export default LiquidityPoolsRoute;
