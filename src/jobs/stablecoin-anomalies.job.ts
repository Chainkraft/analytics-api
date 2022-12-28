import { RecurringJob } from './recurring.job';
import tokenService from '@services/tokens.service';
import { currencyFormat } from '../utils/helpers';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import Jimp from 'jimp';
import { ChartConfiguration } from 'chart.js';
import AlertService from '@/services/alerts.service';
import { isEmpty } from '@/utils/util';
import TokenApiService from '@/services/token-apis.service';
import slug from 'slug';
import * as schedule from 'node-schedule';
const ChartJsImage = require('chartjs-to-image');

/* 
  Stable Alerts twitter bot.
*/
export class StablecoinAnomaliesJob implements RecurringJob {
  public tokenService = new tokenService();
  public alertService = new AlertService();
  public tokenApiService = new TokenApiService();

  doIt(): any {
    console.log('Scheduling StablecoinAnomaliesJob');
    schedule.scheduleJob({ hour: 13, minute: 0 }, () => this.refreshAlerts());
  }

  async refreshAlerts() {
    const numberOfDays = 14;
    const tokens = await this.getStablecoinsForPriceAlert(numberOfDays);
    const latestAlert = await this.alertService.findLatestStablecoinPriceAlert();

    const excludedTokens = [''];
    const tweetTokens = isEmpty(latestAlert)
      ? tokens.filter(token => !excludedTokens.includes(token.symbol))
      : tokens.filter(token => {
          if (excludedTokens.includes(token.symbol)) return false;

          const previousTokenAlarm = latestAlert.tokens.find(yesterdayToken => yesterdayToken.token === token.symbol);
          if (!isEmpty(previousTokenAlarm)) {
            const diff = previousTokenAlarm.price - token.price;
            if (diff > 0.03) return true;
            else return false;
          }

          return true;
        });

    console.log('StablecoinAnomaliesJob', tweetTokens.length, 'tokens to tweet');

    if (tweetTokens.length == 0) return;

    this.alertService.createStablecoinAlert({
      tokens: tokens.map(token => {
        return { token: token.symbol, price: token.price };
      }),
    });

    const twitterClient = new TwitterApi({
      appKey: process.env.STABLEALERTS_APP_KEY,
      appSecret: process.env.STABLEALERTS_APP_SECRET,
      accessToken: process.env.STABLEALERTS_ACCESS_TOKEN,
      accessSecret: process.env.STABLEALERTS_ACCESS_SECRET,
    });

    let firstTweet = `🚨 #Stablecoins with a recent price drop:\n`;

    for (const token of tweetTokens) {
      firstTweet += `\n$${token.symbol} ${currencyFormat(token.price.toString(), 3)} USD`;
    }

    firstTweet += `\n\nDetails 👇`;

    const tweets = [];
    tweets.push({ text: firstTweet });
    for (const token of tweetTokens) {
      const tweet =
        `${token.name} $${token.symbol}` +
        `\nCurrent price: ${currencyFormat(token.price.toString(), 3)} USD` +
        `\nChain: #${token.chains[0]}` +
        `\n\nhttps://analytics.chainkraft.com/tokens/${token.slug}`;

      const chartBuffer = await this.createChart(token, numberOfDays);

      const watermarkedBuffer = await this.waterMark(chartBuffer);

      const mediaId = await twitterClient.v1.uploadMedia(watermarkedBuffer, { mimeType: EUploadMimeType.Png });
      tweets.push({ text: tweet, media: { media_ids: [mediaId] } });
    }
    if (tweets.length > 0) console.log(await twitterClient.v2.tweetThread(tweets));
  }

  public async getStablecoinsForPriceAlert(numberOfDays = 14, excludeTokens: string[] = []) {
    const llamaTokens = await this.tokenApiService.getStablecoinsFromDefiLlama();
    const llamaPrices = await this.tokenApiService.getStablecoinsPricesFromDefiLlama();
    llamaPrices.pop();

    const depeggedLlamaTokens = llamaTokens.filter(
      (token: any) => !excludeTokens.includes(token.symbol) && token.price && token.pegType.includes('peggedUSD') && token.price < 1,
    );

    const lastWeekPrices = [];
    for (let i = 0; i < numberOfDays; i++) {
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
      averagePrices.set(key, value / numberOfDays);
    }

    const depegged: {
      name: string;
      slug: string;
      symbol: string;
      id: string;
      price: number;
      avgPrice: number;
      prices: number[];
      chains: string[];
    }[] = [];

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

      if (llamaToken.price - averagePrice < -0.02) {
        depegged.push({
          name: llamaToken.name,
          slug: slug(llamaToken.name),
          symbol: llamaToken.symbol,
          id: llamaToken.gecko_id,
          price: llamaToken.price,
          avgPrice: averagePrice,
          prices: weeksPrices,
          chains: llamaToken.chains,
        });
      }
    }

    return depegged;
  }

  async waterMark(input: Buffer) {
    const chart = await Jimp.read(input);
    const watermark = await Jimp.read('static/logo.png');

    watermark.resize(chart.bitmap.width / 4, Jimp.AUTO);

    chart.composite(watermark, chart.getWidth() / 2 - watermark.getWidth() / 2, chart.getHeight() / 2 - watermark.getHeight() / 2, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.3,
    });

    return await chart.getBufferAsync(chart.getMIME());
  }

  private async createChart(token: any, numberOfDays = 7) {
    const dates = [...Array(numberOfDays)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    });

    const chartPrices = token.prices.reverse();
    chartPrices.pop();
    chartPrices.push(token.price);

    const width = 800;
    const height = 480;
    const textColor = 'white';
    const configuration: ChartConfiguration = {
      type: 'line',
      data: {
        labels: dates.reverse(),
        datasets: [
          {
            label: token.name,
            data: chartPrices,
          },
        ],
      },
      options: {
        layout: {
          padding: 30,
        },
        elements: {
          point: {
            radius: 0,
            backgroundColor: '#F9A822',
          },
          line: {
            borderWidth: 4,
            borderColor: '#F9A822',
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: {
                size: 14,
              },
            },
            grid: {
              borderColor: textColor,
            },
          },
          y: {
            suggestedMax: Math.max(...chartPrices) + 0.05,
            suggestedMin: Math.min(...chartPrices) - 0.02,
            ticks: {
              color: textColor,
              font: {
                size: 14,
              },
            },
            grid: {
              borderColor: textColor,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: token.name,
            color: textColor,
            font: {
              size: 16,
            },
          },
          legend: {
            display: false,
          },
        },
      },
    };

    const chart = new ChartJsImage();
    chart.setConfig(configuration);
    chart.setWidth(width);
    chart.setHeight(height);
    chart.setChartJsVersion('3.9.1');
    chart.setBackgroundColor('#1A1A2E');

    return await chart.toBinary();
  }
}
