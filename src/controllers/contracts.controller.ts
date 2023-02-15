import { NextFunction, Request, Response } from 'express';
import ContractService from '@services/contracts.service';
import { Contract, ContractNetwork } from '@interfaces/contracts.interface';
import ContractMonitorService from '@services/contracts-monitor.service';
import ProjectService from '@services/project.service';
import { TokenContractSummary, TokenContractSummaryStatus } from '@dtos/token-contract.summary';
import TokenService from '@services/tokens.service';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';

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

  public getContractsSummaryForToken = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      const token = await this.tokenService.findTokenBySlug(slug);
      if (!token || token.contracts.length === 0) {
        throw new HttpException(404, 'Token does not have contracts');
      }

      let summary: TokenContractSummary[] = [];
      token.contracts.forEach((contract: Contract) => {
        const isProxy = this.contractService.isProxyContract(contract);
        const isProxyUpdated = this.contractService.hasProxyContractChanged(contract);
        const latestProxyUpdate = this.contractService.getProxyContractChangedRecord(contract);

        let blockSummary: TokenContractSummary = {
          slug,
          network: contract.network,
          proxyPattern: {
            status: !isProxy
              ? TokenContractSummaryStatus.OK
              : isProxyUpdated
                ? TokenContractSummaryStatus.ALARM
                : TokenContractSummaryStatus.WARNING,
          },
          sourceCode: {
            status: contract.verified
              ? TokenContractSummaryStatus.OK
              : TokenContractSummaryStatus.WARNING,
          },
          proofOfTime: {
            status: Number(new Date()) - Number(contract.createdByBlockAt) > 2628288000 && !isProxyUpdated // last 90 days
              ? TokenContractSummaryStatus.OK
              : TokenContractSummaryStatus.ALARM,
          },
        };

        if (req.user) {
          blockSummary.proxyPattern = {
            status: blockSummary.proxyPattern.status,
            type: contract.proxy?.type,
            address: contract.address,
            implSlot: contract.proxy?.implSlot,
            adminSlot: contract.proxy?.adminSlot,
          };
          blockSummary.sourceCode = {
            status: blockSummary.sourceCode.status,
            size: contract.byteCode.length / 2 - 1,
            createdByBlock: contract.createdByBlock,
            createdByAddress: contract.createdByAddress,
            compilerVersion: contract.verifiedCompilerVersion,
          };
          blockSummary.proofOfTime = {
            status: blockSummary.proofOfTime.status,
            createdByBlock: contract.createdByBlock,
            createdByBlockAt: contract.createdByBlockAt,
            updatedByBlock: latestProxyUpdate !== undefined ? latestProxyUpdate.createdByBlock : undefined,
            updatedByBlockAt: latestProxyUpdate !== undefined ? latestProxyUpdate.createdByBlockAt : undefined,
          };
        }

        summary.push(blockSummary);
      });

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
