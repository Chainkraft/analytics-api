import { NextFunction, Request, Response } from 'express';
import ContractService from '@services/contracts.service';
import { Contract, ContractNetwork } from '@interfaces/contracts.interface';
import ContractMonitorService from '@services/contracts-monitor.service';
import ProjectService from '@services/project.service';
import { TokenContractSummary, TokenContractSummaryStatus } from '@dtos/token-contract.summary';
import TokenService from '@services/tokens.service';
import { HttpException } from '@exceptions/HttpException';

class ContractsController {
  public contractMonitorService = new ContractMonitorService();
  public contractService = new ContractService();
  public projectService = new ProjectService();
  public tokenService = new TokenService();

  public getContracts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.projectService.findProjectBySlug(<string>req.query.project);
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

  public getContractsSummaryForToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const token = await this.tokenService.findTokenBySlug(slug);
      if (!token || token.contracts.length === 0) {
        throw new HttpException(404, 'Token does not have contracts');
      }

      const hasProxyContracts = token.contracts.filter(this.contractService.isProxyContract, this.contractService).length > 0;
      const hasProxyContractsChanged = token.contracts.filter(this.contractService.hasProxyContractChanged, this.contractService).length > 0;

      let status = TokenContractSummaryStatus.OK;
      if (hasProxyContractsChanged) {
        status = TokenContractSummaryStatus.ALARM;
      } else if (hasProxyContracts) {
        status = TokenContractSummaryStatus.WARNING;
      }

      const summary: TokenContractSummary = {
        slug: slug,
        status,
      };

      res.json(summary);
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
