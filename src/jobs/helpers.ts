import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer-core';
import * as fs from 'fs';
import Jimp from 'jimp';
import { NODE_ENV } from '@config';

export async function createChart(url: string, viewport: { width: number; height: number }, selector: string): Promise<Buffer> {
  // Launching a new browser
  const browser: Browser =
    NODE_ENV === 'production'
      ? await puppeteer.launch({
          executablePath: '/usr/bin/chromium-browser',
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        })
      : await puppeteer.launch({
          channel: 'chrome',
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        });

  // Opening a new page in the browser
  const page: Page = await browser.newPage();

  // Emulate UTC timezone
  await page.emulateTimezone('UTC');

  // Navigating to the specified URL with the notification details
  await page.goto(url);

  // Setting the viewport
  await page.setViewport(viewport);

  // Waiting for the selector to be available on the page
  await page.waitForSelector(selector);
  // Adding a delay of 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  // Selecting the element based on the provided selector
  const element: ElementHandle | null = await page.$(selector);

  let buffer: Buffer;

  // If the element is found, take a screenshot and save it in the buffer
  if (element) {
    buffer = (await element.screenshot()) as Buffer;
  } else {
    throw new Error('Element not found');
  }

  // Closing the browser
  await browser.close();

  return buffer;
}

export function saveBufferToPng(buffer: Buffer, filePath: string): void {
  fs.writeFile(filePath, buffer, err => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

export async function waterMark(input: Buffer): Promise<Buffer> {
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

// Function to generate the newsletter sign-up tweet
export function generateNewsletterTweet(): string {
  return (
    'Stay informed with the latest digital asset research and insights. 📊\n' +
    'Be the first to know about our new tools.\n' +
    'Join us: https://chainkraft.com/join ✨'
  );
}
