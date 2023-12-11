import axios from 'axios';
import { llamaStablecoinsClient } from './api-clients';
import { COINGECKO_DEMO_API_KEY, COINMARKETCAP_DEMO_API_KEY } from '@config';

class TokenApiService {
  private geckoClient = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3/',
    headers: {
      'content-type': 'application/json',
      'x_cg_demo_api_key': COINGECKO_DEMO_API_KEY,
    },
  });
  private coinMarketCapClient = axios.create({
    baseURL: 'https://pro-api.coinmarketcap.com/v1/',
    headers: {
      'content-type': 'application/json',
      'X-CMC_PRO_API_KEY': COINMARKETCAP_DEMO_API_KEY,
    },
  });

  public async getStablecoinsFromDefiLlama(): Promise<any> {
    return (await llamaStablecoinsClient.get('stablecoins?includePrices=true')).data.peggedAssets;
  }

  public async getStablecoinsPricesFromDefiLlama(): Promise<any> {
    return (await axios.get('https://stablecoins.llama.fi/stablecoinprices')).data;
  }

  public async getStablecoinDetailsFromDefiLlama(llamaId: string) {
    return (await llamaStablecoinsClient.get(`stablecoin/${llamaId}`)).data;
  }

  public async getGeckoTokens(vs_currency: string, ids: string[]): Promise<any> {
    return this.geckoClient.get('coins/markets', {
      params: {
        vs_currency: vs_currency,
        ids: ids.join(','),
        sparkline: false,
        per_page: 100,
      },
    });
  }

  public async getGeckoToken(id: string): Promise<any> {
    return this.geckoClient.get(`coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: false,
        community_data: false,
        developer_data: false,
      },
    });
  }

  public async getGlobal(): Promise<any> {
    return this.geckoClient.get(`global`);
  }

  public async getCoinMarket(input: { start?: number; limit?: number }): Promise<any> {
    return this.coinMarketCapClient.get(`cryptocurrency/listings/latest`, { params: input });
  }
}

export default TokenApiService;
