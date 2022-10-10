import { PriceHistory } from '@interfaces/tokens.inteface';
import priceHistoryModel from '@/models/prices-history.model';

class PriceService {
  public priceHistory = priceHistoryModel;

  public async findAllPriceHistories(): Promise<PriceHistory[]> {
    return this.priceHistory.find();
  }

  public async findPriceHistoryForToken(tokenSymbol: String): Promise<PriceHistory> {
    return this.priceHistory.findOne({ token: tokenSymbol });
  }
}

export default PriceService;
