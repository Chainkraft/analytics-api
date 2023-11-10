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

// Define log format
const { combine, timestamp, json, errors, colorize, splat } = winston.format;

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  defaultMeta: { service: 'analytics-api' },
  format: combine(errors({ stack: true }), timestamp(), splat(), json()),
  transports: [
    // debug log setting
    new winstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/debug', // log file /logs/debug/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true,
    }),
    // error log setting
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error', // log file /logs/error/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new LokiTransport({
      host: LOG_LOKI_HOST,
    }),
  );
} else {
  logger.add(
    new winston.transports.Console({
      level: 'debug',
      format: combine(
        errors({ stack: true }),
        colorize(),
        timestamp(),
        splat(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            // print log trace
            return `${timestamp} ${level}: ${message} - ${stack}`;
          }
          return `${timestamp} ${level}: ${message}`;
        }),
      ),
      handleExceptions: true,
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
