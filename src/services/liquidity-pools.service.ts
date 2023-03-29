import { refreshUniswapPool } from '@/config/adapters/liquidity-pools/uniswap-v3/uniswap-v3';
import { stablePools } from '@/config/pools/stable-pools';
import { LiquidityPoolHistory, ShortLiquidityPool, SupportedDexes } from '@/interfaces/liquidity-pool-history.interface';
import liquidityPoolHistoryModel from '@/models/liquidity-pool-history.model';
import { isEmpty } from '@/utils/util';
import moment from 'moment';

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

  public async findLiquiditiyPoolHistoryByAddressAndNetwork(address: string, network: string, fresh = false): Promise<LiquidityPoolHistory> {
    const lp = await this.liquidityPoolHistory.findOne({ address: { $regex: address, $options: 'i' }, network: network });

    // refresh uniswap pool if last update was more than 60 minutes ago
    if (fresh && this.shouldRefreshUniswap(lp)) {
      return refreshUniswapPool(network, address);
    }

    return lp;
  }

  public async findAllLiquiditiyPoolSummaries(): Promise<ShortLiquidityPool[]> {
    const savedPools = await this.liquidityPoolHistory.find();

    return savedPools.map(pool => {
      return {
        name: pool.name,
        symbol: pool.symbol,
        network: pool.network,
        address: pool.address,
        dex: pool.dex,
        tvl: pool.usdTotal,
        tokens: pool.balances[0].coins.map(coin => coin.symbol),
      };
    });
  }

  public async findLiquidityPoolForToken(token: string): Promise<ShortLiquidityPool[]> {
    const poolsSummary = stablePools.find(pool => pool.tokenSlug === token);

    if (isEmpty(poolsSummary)) {
      return [];
    }

    const addresses = poolsSummary.pools.map(shortPool => shortPool.address);
    const savedPools = await this.liquidityPoolHistory.find({ address: { $in: addresses } }, { underlyingBalances: 0 }).sort({ usdTotal: 'desc' });

    return savedPools.map(pool => {
      const { name: poolsName, symbol: poolsSymbol } = poolsSummary.pools.find(el => el.address === pool.address) || {};
      return {
        name: pool.name || poolsName || pool.balances[0].coins.map(coin => coin.symbol).join('/'),
        symbol: pool.symbol || poolsSymbol,
        network: pool.network,
        address: pool.address,
        dex: pool.dex,
        tvl: pool.usdTotal,
        tokens: pool.balances[0].coins.map(coin => coin.symbol),
      };
    });
  }

  // some helper functions
  private shouldRefreshUniswap(lp: LiquidityPoolHistory): boolean {
    if (lp?.dex !== SupportedDexes.UNISWAP) {
      return false;
    }

    const latestBalance = lp.balances?.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })[0];

    if (!latestBalance) {
      return true;
    }
    return moment().diff(moment(latestBalance.date), 'minutes') > 60;
  }
}

export default LiquidityPoolService;
