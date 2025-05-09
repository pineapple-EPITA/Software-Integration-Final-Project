import winston from 'winston';
import { Request, Response } from 'express';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export const logRequest = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
};

export const logError = (err: Error) => {
  logger.error({
    message: err.message,
    stack: err.stack
  });
};

export default logger; 