import {NextFunction, Request, Response} from 'express';
import ContractService from "@services/contracts.service";
import {ProxyImport} from "@/jobs/proxy-import.job";
import {Contract} from "@interfaces/contracts.interface";
import ContractMonitorService from "@services/contracts-monitor.service";

class ContractsController {
  public contractMonitor = new ContractMonitorService();
  public contractService = new ContractService();
  public proxyImport = new ProxyImport();

  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      this.contractService.findAllContracts().then(contracts => {
        res.json(contracts);
      });
    } catch (error) {
      next(error);
    }
  };

  public getContractByAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contractAddress: string = req.params.address;
      const contract: Contract = await this.contractService.findContractByAddress(contractAddress);

      res.status(200).json({data: contract, message: 'findOne'});
    } catch (error) {
      next(error);
    }
  };

  public import = async (req: Request, res: Response) => {
    await this.proxyImport.doIt();
    await this.contractMonitor.synchronizeContractWebhooks();
    res.status(200).json();
  };
}

export default ContractsController;
