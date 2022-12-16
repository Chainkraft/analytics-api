import { PriceHistory } from '@interfaces/tokens.inteface';
import priceHistoryModel from '@/models/prices-history.model';

class TokensPriceService {
  public priceHistory = priceHistoryModel;

  public async findAllPriceHistories(): Promise<PriceHistory[]> {
    return this.priceHistory.find();
  }

  public async findPriceHistoryForToken(tokenSymbol: String): Promise<PriceHistory> {
    return this.priceHistory.findOne({ token: tokenSymbol });
  }

  public async findPriceHistoryForTokenBySlug(slug: String): Promise<PriceHistory> {
    return this.priceHistory.findOne({ slug: slug });
  }
}

export default TokensPriceService;
