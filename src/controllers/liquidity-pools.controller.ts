import { NextFunction, Request, Response } from 'express';
import LiquidityPoolService from '@/services/liquidity-pools.service';
import { LiquidityPoolHistory } from '@/interfaces/liquidity-pool-history.interface';

class LiquidityPoolsController {
  public lpsService = new LiquidityPoolService();

  public getLiquidityPoolsByDex = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dex: string = req.params.dex;
      const lpHistoryData: LiquidityPoolHistory[] = await this.lpsService.findLiquidityPoolsByDex(dex);

      res.status(200).json({ data: lpHistoryData, message: 'findMany' });
    } catch (error) {
      next(error);
    }
  };

  public getLiquidityPoolHistoryDetailsBySymbol = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lpSymbol: string = req.params.symbol;
      const dex: string = req.params.dex;
      const lpHistoryData: LiquidityPoolHistory = await this.lpsService.findLiquiditiyPoolHistory(lpSymbol, dex);

      res.status(200).json({ data: lpHistoryData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getLiquidityPoolHistoryDetailsByAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address: string = req.params.address;
      const network: string = req.params.network;
      const lpHistoryData: LiquidityPoolHistory = await this.lpsService.findLiquiditiyPoolHistoryByAddressAndNetwork(address, network);

      res.status(200).json({ data: lpHistoryData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public findLiquiditiyPoolHistoryByDexAndNetwork = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dex: string = req.params.dex;
      const network: string = req.params.network;
      const lpHistoryData: LiquidityPoolHistory[] = await this.lpsService.findLiquiditiyPoolHistoryByDexAndNetwork(dex, network);

      res.status(200).json({ data: lpHistoryData, message: 'findMany' });
    } catch (error) {
      next(error);
    }
  };
}

export default LiquidityPoolsController;
