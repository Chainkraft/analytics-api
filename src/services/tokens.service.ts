import { MarketCapHistory, Token, PriceHistory } from '@interfaces/tokens.inteface';
import tokenModel from '@models/tokens.model';
import { llamaStablecoinDetailsParser, llamaStablesListParser } from '@/utils/helpers';
import marketCapHistoryModel from '@/models/mcap-history.model';
import priceHistoryModel from '@/models/prices-history.model';

import TokenApiService from './token-apis.service';
import PriceService from './prices.service';
import { isEmpty } from '@/utils/util';
import { HttpException } from '@/exceptions/HttpException';

class TokenService {
  public tokens = tokenModel;
  public marketCapHistory = marketCapHistoryModel;
  public priceHistory = priceHistoryModel;
  private priceService = new PriceService();
  private tokenApiService = new TokenApiService();

  public async findAllToken(): Promise<Token[]> {
    const tokens: Token[] = await this.tokens.find();
    return tokens;
  }

  public async findAllStablecoins(): Promise<Token[]> {
    const tokens: Token[] = await this.tokens.find({ pegged: true });

    if (tokens.length == 0) {
      return this.fetchFreshGeckoAndLlamaStablecoins();
    } else {
      const refresh = (Date.now() - tokens[0].updatedAt.getTime()) / 1000 > 10 ? true : false;
      if (refresh) {
        return this.fetchFreshGeckoAndLlamaStablecoins();
      }
    }
    return tokens;
  }

  public async fetchFreshGeckoAndLlamaStablecoins(): Promise<Token[]> {
    const llamaStables = await this.tokenApiService.getStablecoinsFromDefiLlama();
    const llamaStablesPeggedUSD = llamaStables.filter((token: any) => token.pegType.includes('peggedUSD') && token.price);

    const geckoTokens = await this.tokenApiService.getGeckoTokens(
      'usd',
      llamaStablesPeggedUSD.map(token => token.gecko_id),
    );

    const tokens: Token[] = [];

    llamaStablesPeggedUSD.map((llamaToken: any) => {
      const updatedToken: Token = llamaStablesListParser(llamaToken);
      const geckoToken = geckoTokens.data.find(gecko => gecko.id == updatedToken.gecko_id);
      if (geckoToken !== undefined) {
        updatedToken.image = geckoToken.image;
        updatedToken.current_price = geckoToken.current_price;
        updatedToken.volume_24h = geckoToken.total_volume;
        updatedToken.price_change_24h = geckoToken.price_change_24h;
        updatedToken.current_market_cap = geckoToken.market_cap;
      } else {
        updatedToken.current_price = llamaToken.price;
      }
      tokens.push(updatedToken);
    });

    return Promise.all(
      tokens.map(async (token: Token) => {
        token.pegged = true;

        return this.tokens.findOneAndUpdate({ symbol: token.symbol }, token, {
          new: true,
          upsert: true,
        });
      }),
    );
  }

  public async findStablecoinDetails(tokenSymbol: string): Promise<{ token: Token; marketCapHistory: MarketCapHistory; priceHistory: PriceHistory }> {
    const token: Token = await this.tokens.findOne({ symbol: tokenSymbol });
    const marketCapHistory: MarketCapHistory = await this.marketCapHistory.findOne({ symbol: tokenSymbol });

    if (isEmpty(token)) throw new HttpException(400, 'Token not found');

    const refresh = (Date.now() - token.updatedAt.getTime()) / 1000 > 60 || isEmpty(marketCapHistory) ? true : false;
    if (refresh) {
      return this.fetchFreshTokenDetails(token);
    }

    return {
      token: token,
      marketCapHistory: marketCapHistory,
      priceHistory: await this.priceService.findPriceHistoryForToken(tokenSymbol),
    };
  }

  private async fetchFreshTokenDetails(token: Token): Promise<{ token: Token; marketCapHistory: MarketCapHistory; priceHistory: PriceHistory }> {
    const llamaToken = await this.tokenApiService.getStablecoinDetailsFromDefiLlama(token.llama_id);
    const newToken = llamaStablecoinDetailsParser(llamaToken);

    return {
      token: await this.tokens.findOneAndUpdate({ llama_id: newToken.llama_id }, newToken, {
        new: true,
        upsert: true,
      }),
      marketCapHistory: await this.computeMarketCapHistory(token.symbol, llamaToken),
      priceHistory: await this.priceService.findPriceHistoryForToken(token.symbol),
    };
  }

  private async computeMarketCapHistory(tokenSymbol: string, llamaToken: any): Promise<MarketCapHistory> {
    const marketCapHistory = await this.marketCapHistory.findOne({ symbol: tokenSymbol });

    // if history is from yesterday, then refresh
    if (isEmpty(marketCapHistory) || marketCapHistory.updatedAt.toDateString() !== new Date().toDateString()) {
      const freshMarketCapHistory = {
        market_caps: llamaToken.tokens.map((mCapRow: any) => {
          return { date: mCapRow.date * 1000, market_cap: mCapRow.circulating.peggedUSD };
        }),
      };

      return this.marketCapHistory.findOneAndUpdate({ symbol: tokenSymbol }, freshMarketCapHistory, {
        new: true,
        upsert: true,
      });
    }

    return marketCapHistory;
  }
}

export default TokenService;
