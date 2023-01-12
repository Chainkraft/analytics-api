import { ShortLiquidityPool, stablePools } from '@/config/stable-pools';
import { LiquidityPoolHistory } from '@/interfaces/liquidity-pool-history.interface';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';
import { isEmpty } from '@/utils/util';

class LiquidityPoolService {
  public liquidityPoolHistory = liquidityPoolHistoryModel;

  public async findAllLiquiditiyPoolHistories(): Promise<LiquidityPoolHistory[]> {
    return this.liquidityPoolHistory.find();
  }

  public async findLiquidityPoolsByDex(dex: String): Promise<LiquidityPoolHistory[]> {
    return this.liquidityPoolHistory.find({ dex: dex });
  }

  public async findLiquiditiyPoolHistory(symbol: String, dex: String): Promise<LiquidityPoolHistory> {
    return this.liquidityPoolHistory.findOne({ symbol: { $regex: symbol, $options: 'i' }, dex: dex });
  }

  public async findLiquiditiyPoolHistoryByDexAndNetwork(dex: String, network: String): Promise<LiquidityPoolHistory[]> {
    return this.liquidityPoolHistory.find({ network: network, dex: dex });
  }

  public async findLiquiditiyPoolHistoryByAddressAndNetwork(address: String, network: String): Promise<LiquidityPoolHistory> {
    return this.liquidityPoolHistory.findOne({ address: { $regex: address, $options: 'i' }, network: network });
  }

  public async findLiquidityPoolForToken(token: string): Promise<ShortLiquidityPool[]> {
    const poolsSummary = stablePools.find(pool => pool.tokenSlug === token);

    if (isEmpty(poolsSummary)) {
      return [];
    }

    const addreses = poolsSummary.pools.map(shortPool => shortPool.address);
    const savedPools = await this.liquidityPoolHistory.find({ address: { $in: addreses } }, { underlyingBalances: 0 }).sort({ usdTotal: 'desc' });

    return savedPools.map(pool => {
      const { name: poolsName, symbol: poolsSymbol } = poolsSummary.pools.find(el => el.address === pool.address) || {};
      return {
        name: pool.name || poolsName || pool.balances[0].coins.map(coin => coin.symbol).join('/'),
        symbol: pool.symbol || poolsSymbol,
        address: pool.address,
        dex: pool.dex,
        tvl: pool.usdTotal,
      };
    });
  }
}

export default LiquidityPoolService;
