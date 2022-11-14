import { NextFunction, Request, Response } from 'express';
import LiquidityPoolService from '@/services/liquidity-pools.service';
import { LiquidityPoolHistory } from '@/interfaces/curve-interfaces';

class LiquidityPoolsController {
  public lpsService = new LiquidityPoolService();

  public getLiquidityPoolHistoryDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lpSymbol: string = req.params.symbol;
      const dex = 'curve';
      const lpHistoryData: LiquidityPoolHistory = await this.lpsService.findLiquiditiyPoolHistory(lpSymbol, dex);

      res.status(200).json({ data: lpHistoryData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getLiquidityPoolsByDex = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dex: string = req.params.dex;
      const lpHistoryData: LiquidityPoolHistory[] = await this.lpsService.findLiquidityPoolsByDex(dex);

      res.status(200).json({ data: lpHistoryData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default LiquidityPoolsController;
