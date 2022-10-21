import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import ContractsController from '@controllers/contracts.controller';

class ContractsRoute implements Routes {
  public path = '/contracts';
  public router = Router();
  public contractsController = new ContractsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.contractsController.getContracts);
    this.router.get(`${this.path}/:network/:address`, this.contractsController.getContract);
    this.router.post(`${this.path}/callback/address-activity`, this.contractsController.processAddressActivityCallback);
  }
}

export default ContractsRoute;
