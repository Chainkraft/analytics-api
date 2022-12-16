import { NextFunction, Request, Response } from 'express';
import TokenService from '@services/tokens.service';
import { MarketCapHistory, PriceHistory, Token } from '@/interfaces/tokens.inteface';
import TokensPriceService from '@/services/tokens-prices.service';

class TokensController {
  public tokenService = new TokenService();
  public pricesService = new TokensPriceService();

  public getPeggedTokens = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllPeggedTokens: Token[] = (await this.tokenService.findAllStablecoins()).sort((a, b) => b.current_market_cap - a.current_market_cap);

      res.status(200).json({ data: findAllPeggedTokens, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getTokenDetailsBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug: string = req.params.slug;
      const findTokenData: { token: Token; marketCapHistory: MarketCapHistory; priceHistory: PriceHistory } =
        await this.tokenService.findStablecoinDetailsBySlug(slug);

      res.status(200).json({ data: findTokenData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getTokenDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenSymbol: string = req.params.symbol.toUpperCase();
      const findTokenData: { token: Token; marketCapHistory: MarketCapHistory; priceHistory: PriceHistory } =
        await this.tokenService.findStablecoinDetails(tokenSymbol);

      res.status(200).json({ data: findTokenData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default TokensController;
