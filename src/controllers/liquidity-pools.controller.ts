import { NextFunction, Request, Response } from 'express';
import LiquidityPoolService from '@/services/liquidity-pools.service';
import { LiquidityPoolHistory, ShortLiquidityPool } from '@/interfaces/liquidity-pool-history.interface';

class LiquidityPoolsController {
  public lpsService = new LiquidityPoolService();

  public getLiquidityPoolSummaries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pools: ShortLiquidityPool[] = await this.lpsService.findAllLiquiditiyPoolSummaries();

      res.status(200).json(pools);
    } catch (error) {
      next(error);
    }
  };

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
      const data: LiquidityPoolHistory = await this.lpsService.findLiquiditiyPoolHistoryByAddressAndNetwork(address, network, true);

      res.status(200).json(data);
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

  public getLiquidityPoolsForToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token: string = req.params.token;

      const pools: ShortLiquidityPool[] = await this.lpsService.findLiquidityPoolForToken(token);
      res.status(200).json(pools);
    } catch (error) {
      next(error);
    }
  };
}

export default LiquidityPoolsController;
