import axios from 'axios';

class TokenApiService {
  private llamaStablecoinsClient = axios.create({
    baseURL: 'https://stablecoins.llama.fi/',
    headers: {
      'content-type': 'application/json',
    },
  });

  private geckoClient = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3/',
    headers: {
      'content-type': 'application/json',
    },
  });

  public async getStablecoinsFromDefiLlama(): Promise<any> {
    return (await this.llamaStablecoinsClient.get('stablecoins?includePrices=true')).data.peggedAssets;
  }

  public async getStablecoinsPricesFromDefiLlama(): Promise<any> {
    return (await axios.get('https://stablecoins.llama.fi/stablecoinprices')).data;
  }

  public async getStablecoinDetailsFromDefiLlama(llamaId: string) {
    return (await this.llamaStablecoinsClient.get(`stablecoin/${llamaId}`)).data;
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
}

export default TokenApiService;
