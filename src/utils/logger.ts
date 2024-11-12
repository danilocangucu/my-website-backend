import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const hohohoLogFormat = printf(({ level, message, timestamp }) => {
  return `[HOHOHO] ${timestamp} ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), colorize(), logFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

export const hohohoLogger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), colorize(), hohohoLogFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/hohoho.log" }),
  ],
});
