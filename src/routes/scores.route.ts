import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import ScoresController from '@/controllers/scores.controller';

class ScoresRoute implements Routes {
  public path = '/score';
  public router = Router();
  public scoresController = new ScoresController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.scoresController.getLastScore);
  }
}

export default ScoresRoute;
