import { MarketCapHistory, PriceHistory, Token } from '@interfaces/tokens.inteface';
import tokenModel from '@models/tokens.model';
import { llamaStablecoinDetailsParser, llamaStablesListParser } from '@/utils/helpers';
import marketCapHistoryModel from '@/models/mcap-history.model';
import priceHistoryModel from '@/models/prices-history.model';

import TokenApiService from './token-apis.service';
import TokensPriceService from './tokens-prices.service';
import { isEmpty } from '@/utils/util';
import { HttpException } from '@/exceptions/HttpException';
import slug from 'slug';
import moment from 'moment';
import { Contract } from '@interfaces/contracts.interface';

class TokenService {
  public tokens = tokenModel;
  public marketCapHistory = marketCapHistoryModel;
  public priceHistory = priceHistoryModel;
  private priceService = new TokensPriceService();
  private tokenApiService = new TokenApiService();

  public async findAllToken(): Promise<Token[]> {
    const tokens: Token[] = await this.tokens.find();
    return tokens;
  }

  public async findAllStablecoins(): Promise<Token[]> {
    let tokens: Token[] = await this.tokens.find({ pegged: true });

    if (tokens.length === 0 || moment().diff(tokens[0].updatedAt, 'seconds') > 10) {
      try {
        tokens = await this.fetchFreshGeckoAndLlamaStablecoins();
      } catch (error) {
        console.error(`Error fetching fresh Gecko and Llama stablecoins: ${error}`);
      }
    }

    return tokens;
  }

  public async findTokenBySlug(slug: string): Promise<Token> {
    if (slug === undefined) throw new HttpException(400, 'Slug is empty');
    return this.tokens.findOne({ slug: slug }).populate('contracts');
  }

  public async findTokenByContract(contract: Contract): Promise<Token> {
    if (contract === undefined) throw new HttpException(400, 'Contract is empty');
    return this.tokens.findOne({ contracts: contract._id });
  }

  public async fetchFreshGeckoAndLlamaStablecoins(): Promise<Token[]> {
    // Get stablecoins from DefiLlama
    const llamaStables = await this.tokenApiService.getStablecoinsFromDefiLlama();
    const llamaStablesPeggedUSD = llamaStables.filter((token: any) => token.pegType.includes('peggedUSD') && token.price);

    // Get tokens from Gecko
    let geckoTokens = { data: [] };
    try {
      geckoTokens = await this.tokenApiService.getGeckoTokens(
        'usd',
        llamaStablesPeggedUSD.map(token => token.gecko_id),
      );
    } catch (error) {
      console.error(`Error fetching Gecko tokens: ${error}`);
    }

    // Update tokens with data from Gecko if available
    const tokens: Token[] = llamaStablesPeggedUSD.map((llamaToken: any) => {
      const updatedToken: Token = llamaStablesListParser(llamaToken);
      updatedToken.current_price = llamaToken.price;

      if (geckoTokens.data.length > 0) {
        const geckoToken = geckoTokens.data.find(gecko => gecko.id == updatedToken.gecko_id);
        if (geckoToken !== undefined) {
          updatedToken.image = geckoToken.image;
          updatedToken.current_price = geckoToken.current_price;
          updatedToken.volume_24h = geckoToken.total_volume;
          updatedToken.price_change_24h = geckoToken.price_change_24h;
          updatedToken.current_market_cap = geckoToken.market_cap;
        }
      }

      return updatedToken;
    });

    // Update tokens in database
    const updatedTokens = tokens.map(async (token: Token) => {
      token.pegged = true;
      token.slug = slug(token.name);
      return this.tokens.findOneAndUpdate({ slug: token.slug }, token, { new: true, upsert: true });
    });

    return Promise.all(updatedTokens);
  }

  public async findStablecoinDetailsBySlug(slug: string): Promise<{
    token: Token;
    marketCapHistory: MarketCapHistory;
    priceHistory: PriceHistory;
  }> {
    const token: Token = await this.tokens.findOne({ slug: slug });
    const marketCapHistory: MarketCapHistory = await this.marketCapHistory.findOne({ slug: slug });

    if (isEmpty(token)) throw new HttpException(400, 'Token not found');

    const tokenRefresh = (Date.now() - token.updatedAt.getTime()) / 1000 > 60 || isEmpty(marketCapHistory) ? true : false;
    const mCapRefresh = isEmpty(marketCapHistory) || marketCapHistory.updatedAt.toDateString() !== new Date().toDateString() ? true : false;

    if (tokenRefresh || mCapRefresh) {
      return this.fetchFreshTokenDetails(token);
    }

    return {
      token: token,
      marketCapHistory: marketCapHistory,
      priceHistory: await this.priceService.findPriceHistoryForTokenBySlug(slug),
    };
  }

  public async findStablecoinDetails(tokenSymbol: string): Promise<{
    token: Token;
    marketCapHistory: MarketCapHistory;
    priceHistory: PriceHistory;
  }> {
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

  public async createOrUpdateToken(token: Token): Promise<Token> {
    if (isEmpty(token)) throw new HttpException(400, 'Token is empty');
    if (isEmpty(token.slug)) {
      token.slug = slug(token.name);
    }

    return this.tokens.findOneAndUpdate({ slug: token.slug }, token, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  private async fetchFreshTokenDetails(token: Token): Promise<{
    token: Token;
    marketCapHistory: MarketCapHistory;
    priceHistory: PriceHistory;
  }> {
    const llamaToken = await this.tokenApiService.getStablecoinDetailsFromDefiLlama(token.llama_id);
    const newToken = llamaStablecoinDetailsParser(llamaToken);

    return {
      token: await this.createOrUpdateToken(newToken),
      marketCapHistory: await this.computeMarketCapHistory(token.slug, llamaToken),
      priceHistory: await this.priceService.findPriceHistoryForTokenBySlug(token.slug),
    };
  }

  private async computeMarketCapHistory(slug: string, llamaToken: any): Promise<MarketCapHistory> {
    const marketCapHistory = await this.marketCapHistory.findOne({ slug: slug });

    // if history is from yesterday, then refresh
    if (isEmpty(marketCapHistory) || marketCapHistory.updatedAt.toDateString() !== new Date().toDateString()) {
      const freshMarketCapHistory = {
        market_caps: llamaToken.tokens.map((mCapRow: any) => {
          return { date: mCapRow.date * 1000, market_cap: mCapRow.circulating.peggedUSD };
        }),
      };

      return this.marketCapHistory.findOneAndUpdate({ slug: slug }, freshMarketCapHistory, {
        new: true,
        upsert: true,
      });
    }

    return marketCapHistory;
  }
}

export default TokenService;
