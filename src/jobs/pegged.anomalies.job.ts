import { RecurringJob } from './recurring.job';
import tokenService from '@services/tokens.service';
import { currencyFormat } from '../utils/helpers';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import { ChartConfiguration } from 'chart.js';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';

/*
Stable Alerts twitter bot.
*/
export class PeggedAssetAnomaliesJob implements RecurringJob {
  public tokenService = new tokenService();

  async doIt() {
    const tokens = await this.tokenService.getPeggedAssetsWithAnomalies();

    if (tokens.length == 0) {
      return;
    }

    const twitterClient = new TwitterApi({
      appKey: process.env.STABLEALERTS_APP_KEY,
      appSecret: process.env.STABLEALERTS_APP_SECRET,
      accessToken: process.env.STABLEALERTS_ACCESS_TOKEN,
      accessSecret: process.env.STABLEALERTS_ACCESS_SECRET,
    });

    let firstTweet = `🚨 #Stablecoins with a recent price drop:\n`;

    for (const token of tokens) {
      firstTweet += `\n$${token.symbol} ${currencyFormat(token.price, 3)} USD`;
    }

    firstTweet += `\n\nDetails 👇`;

    const tweets = [];
    tweets.push({ text: firstTweet });
    for (const token of tokens) {
      const tweet = `${token.name} $${token.symbol}` + `\nCurrent price: ${currencyFormat(token.price, 3)} USD` + `\nChain: #${token.chains[0]}`;
      const chartBuffer = await this.createChart(token);
      const mediaId = await twitterClient.v1.uploadMedia(chartBuffer, { mimeType: EUploadMimeType.Png });

      tweets.push({ text: tweet, media: { media_ids: [mediaId] } });
    }

    console.log(await twitterClient.v2.tweetThread(tweets));
  }

  private async createChart(token: any) {
    const dates = [...Array(7)].map((_, i) => {
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
    const chartCallback: ChartCallback = ChartJS => {
      ChartJS.defaults.responsive = true;
      ChartJS.defaults.maintainAspectRatio = false;
    };

    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: '#1A1A2E',
      chartCallback: chartCallback,
    });
    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    return buffer;
  }
}
