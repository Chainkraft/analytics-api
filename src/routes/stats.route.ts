import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import StatsController from '@/controllers/stats.controller';

class StatsRoute implements Routes {
  public path = '/stats';
  public router = Router();
  public statsController = new StatsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/global`, this.statsController.getGlobalStats);
    this.router.get(`${this.path}/stablecoins`, this.statsController.getStablecoinStats);
  }
}

export default StatsRoute;
