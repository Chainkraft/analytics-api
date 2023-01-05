import { LiquidityPoolHistory } from '@/interfaces/liquidity-pool-history.interface';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';

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

  public async findLiquiditiyPoolHistoryByDexAndNetwork(dex: String, network: String): Promise<LiquidityPoolHistory[]> {
    return this.liquiditiyPoolHistory.find({ network: network, dex: dex });
  }

  public async findLiquiditiyPoolHistoryByAddressAndNetwork(address: String, network: String): Promise<LiquidityPoolHistory> {
    return this.liquiditiyPoolHistory.findOne({ address: { $regex: address, $options: 'i' }, network: network });
  }
}

export default LiquidityPoolService;
