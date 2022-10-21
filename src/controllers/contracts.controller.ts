import { NextFunction, Request, Response } from 'express';
import ContractService from '@services/contracts.service';
import { Contract, ContractNetwork } from '@interfaces/contracts.interface';
import ContractMonitorService from '@services/contracts-monitor.service';
import ProjectService from '@services/project.service';

class ContractsController {
  public contractMonitorService = new ContractMonitorService();
  public contractService = new ContractService();
  public projectService = new ProjectService();

  public getContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.findProjectBySlug(req.query.project);
      const contracts = await this.contractService.findContractsByProject(project._id);
      res.json({ data: contracts });
    } catch (error) {
      next(error);
    }
  };

  public getContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contractAddress = req.params.address;
      const network = ContractNetwork[req.params.network];
      const contract: Contract = await this.contractService.findContract(contractAddress, network);

      res.status(200).json({ data: contract });
    } catch (error) {
      next(error);
    }
  };

  public processAddressActivityCallback = (req: Request, res: Response, next: NextFunction) => {
    try {
      this.contractMonitorService.processAddressActivity(req.body).then(() => console.log('Processed contracts activity'));
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  };
}

export default ContractsController;
