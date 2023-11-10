import { NextFunction, Request, Response } from 'express';
import BlockchainService from '@services/blockchain.service';
import { ContractNetwork } from '@interfaces/contracts.interface';
import { getFulfilled } from '@utils/typeguard';

class BlockchainsController {
  public blockchainService = new BlockchainService();

  public getLastBlocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blocks = new Map<ContractNetwork, number>();
      const requests = [];
      Object.keys(ContractNetwork).forEach((key) => {
        const network = ContractNetwork[key];
        requests.push(this.blockchainService.getBlockNumber(network));
      });

      const responses = await Promise.allSettled(requests);
      for (let i = 0; i < Object.keys(ContractNetwork).length; i++) {
        const network = ContractNetwork[Object.keys(ContractNetwork)[i]];
        blocks.set(network, getFulfilled(responses[i]).value);
      }

      res.json(Object.fromEntries(blocks));
    } catch (error) {
      next(error);
    }
  };
}

export default BlockchainsController;
