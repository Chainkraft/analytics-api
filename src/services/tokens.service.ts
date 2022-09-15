import { hash } from 'bcrypt';
import { HttpException } from '@exceptions/HttpException';
import { Token } from '@interfaces/tokens.inteface';
import tokenModel from '@models/tokens.model';
import { isEmpty } from '@utils/util';
import axios from 'axios';
import { stableByMarketCapParser } from '@/utils/helpers';

class TokenService {
  public tokens = tokenModel;

  public async findAllToken(): Promise<Token[]> {
    const tokens: Token[] = await this.tokens.find();
    return tokens;
  }

  public async findAllPeggedTokens(): Promise<Token[]> {
    const tokens: Token[] = await this.tokens.find({ pegged: true });
    if (tokens.length > 0) {
      const refresh = (Date.now() - tokens[0].updatedAt.getTime()) / 1000 > 120 ? true : false;
      if (refresh) {
        console.log('Fetching fresh stablecoins');
        return this.fetchFreshPeggedAssets();
      }
    }
    return tokens;
  }

  private async fetchFreshPeggedAssets(): Promise<Token[]> {
    const stablesByMarketCap = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=stablecoins&order=market_cap_desc&per_page=100&page=1&sparkline=false',
    );

    const filteredStables = stablesByMarketCap.data.filter(
      (element: any) => !element.name.toLowerCase().includes('gold') && !element.name.toLowerCase().includes('eur'),
    );

    const coins: Token[] = [];

    filteredStables.map((coin: any) => {
      coins.push(stableByMarketCapParser(coin));
    });

    return await Promise.all(
      coins.map(async (coin: any) => {
        // array push definition
        coin.pegged = true;
        coin.$push = { prices: { price: coin.current_price, date: Date.now() } };

        return await this.tokens.findOneAndUpdate({ symbol: coin.symbol }, coin, {
          new: true,
          upsert: true, // Make this update into an upsert
        });
      }),
    );
  }

  /* 
  Methods for twitter bots
  */

  public async getPeggedAssetsWithAnomalies() {
    const llamaTokens = await this.getStablecoinsFromDefiLlama();
    const llamaPrices = await this.getStablecoinsPricesFromDefiLlama();
    llamaPrices.pop();

    const depeggedLlamaTokens = llamaTokens.filter((token: any, _ind: any, _arr: any) => token.pegType.includes('peggedUSD') && token.price < 1);

    const lastWeekPrices = [];
    for (let i = 0; i < 7; i++) {
      lastWeekPrices.push(llamaPrices.pop());
    }

    const averagePrices = new Map<string, number>();
    for (const day of lastWeekPrices) {
      for (const key in day.prices) {
        const dayPrice = day.prices[key];
        if (averagePrices.has(key)) {
          averagePrices.set(key, averagePrices.get(key) + dayPrice);
        } else {
          averagePrices.set(key, dayPrice);
        }
      }
    }

    for (const [key, value] of averagePrices) {
      averagePrices.set(key, value / 7);
    }

    const depegged: { name: string; symbol: string; id: string; price: number; avgPrice: number; prices: number[]; chains: string[] }[] = [];

    for (const llamaToken of depeggedLlamaTokens) {
      const averagePrice = averagePrices.get(llamaToken.gecko_id);
      const weeksPrices = [];
      for (const day of lastWeekPrices) {
        for (const key in day.prices) {
          if (key == llamaToken.gecko_id) {
            weeksPrices.push(day.prices[key]);
          }
        }
      }

      if (llamaToken.price - averagePrice < -0.01) {
        depegged.push({
          name: llamaToken.name,
          symbol: llamaToken.symbol,
          id: llamaToken.gecko_id,
          price: llamaToken.price,
          avgPrice: averagePrice,
          prices: weeksPrices,
          chains: llamaToken.chains,
        });
      }
    }

    console.log('depegged: ');
    console.log(depegged);

    return depegged;
  }

  private async getStablecoinsPricesFromDefiLlama(): Promise<any> {
    const llamaPrices = await axios.get('https://stablecoins.llama.fi/stablecoinprices');
    return llamaPrices.data;
  }

  private async getStablecoinsFromDefiLlama(): Promise<any> {
    const llamaStables = await axios.get('https://stablecoins.llama.fi/stablecoins?includePrices=true');
    return llamaStables.data.peggedAssets;
  }
}

export default TokenService;
