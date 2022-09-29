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
    this.router.get(`${this.path}`, this.contractsController.index);
    this.router.get(`${this.path}/import`, this.contractsController.import);
    this.router.get(`${this.path}/:address`, this.contractsController.getContractByAddress);
    this.router.post(`${this.path}/callback/address-activity`, this.contractsController.processAddressActivityCallback);
  }
}

export default ContractsRoute;
