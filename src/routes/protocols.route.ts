import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import ProtocolsController from '@controllers/protocols.controller';

class ProtocolsRoute implements Routes {
  public path = '/protocols';
  public router = Router();
  public protocolsController = new ProtocolsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.protocolsController.getAllProtocols);
    this.router.get(`${this.path}/:slug`, this.protocolsController.getProtocol);
  }
}

export default ProtocolsRoute;
