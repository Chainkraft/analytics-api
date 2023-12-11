import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import { LOG_DIR, LOG_LOKI_HOST } from '@/config/index';
import { Request } from 'express';
import LokiTransport from 'winston-loki';

// logs dir
const logDir: string = join(__dirname, LOG_DIR);
const skipLogForUrls = ['/', '/metrics'];

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const { combine, timestamp, printf, splat } = winston.format;
const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} [${level}] : ${message} `;
});

const logger = winston.createLogger({
  defaultMeta: { service: 'analytics-api' },
  level: 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), splat(), myFormat),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
    }),
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',
      filename: `%DATE%.log`,
      maxFiles: '30d',
      handleExceptions: true,
    }),
    new winstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/debug',
      filename: `%DATE%.log`,
      maxFiles: '30d',
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  console.log('Enabling LOKI transport');
  logger.add(
    new LokiTransport({
      host: LOG_LOKI_HOST,
      json: true,
      onConnectionError: err => console.error(err),
    }),
  );
}

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

const skip = (req: Request) => skipLogForUrls.includes(req.url);

export { logger, stream, skip };
