import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";
import { LOG_DIR, LOG_LOKI_HOST } from "@/config/index";
import { Request } from "express";
import LokiTransport from "winston-loki";

// logs dir
const logDir: string = join(__dirname, LOG_DIR);
const skipLogForUrls = ["/", "/metrics"];

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss', }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
);

const logger = winston.createLogger({
  defaultMeta: { service: "analytics-api" },
  format: logFormat,
  transports: [
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true
    }),
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error",
      filename: `%DATE%.log`,
      maxFiles: "30d",
      handleExceptions: true,
      json: false
    }),
    new winstonDaily({
      level: "debug",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/debug",
      filename: `%DATE%.log`,
      maxFiles: "30d",
      json: false
    })
  ]
});

if (process.env.NODE_ENV === "production") {
  logger.info("Enabling LOKI transport");
  logger.add(new LokiTransport({ host: LOG_LOKI_HOST }));
}

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf("\n")));
  }
};

const skip = (req: Request) => skipLogForUrls.includes(req.url);

export { logger, stream, skip };
