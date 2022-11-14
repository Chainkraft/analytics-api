import { LiquidityPoolHistory } from '@/interfaces/curve-interfaces';
import liquidityPoolHistoryModel from '@/models/lp-history.model';

class LiquidityPoolService {
  public liquiditiyPoolHistory = liquidityPoolHistoryModel;

  public async findAllLiquiditiyPoolHistories(): Promise<LiquidityPoolHistory[]> {
    return this.liquiditiyPoolHistory.find();
  }

  public async findLiquidityPoolsByDex(dex: String): Promise<LiquidityPoolHistory[]> {
    return this.liquiditiyPoolHistory.find({ dex: dex });
  }

  public async findLiquiditiyPoolHistory(symbol: String, dex: String): Promise<LiquidityPoolHistory> {
    return this.liquiditiyPoolHistory.findOne({ symbol: { $regex: symbol, $options: 'i' }, dex: dex });
  }
}

export default LiquidityPoolService;
