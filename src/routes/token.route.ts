import { Router } from 'express';
import TokensController from '@controllers/tokens.controller';
import { Routes } from '@interfaces/routes.interface';

class TokensRoute implements Routes {
  public path = '/tokens';
  public router = Router();
  public tokensController = new TokensController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:symbol`, this.tokensController.getTokenDetails);
  }
}

export default TokensRoute;
