import { Request, Response, NextFunction } from 'express';
import logger from './winston';
import { badRequest } from '../constants/statusCodes';

interface RequestBody {
  [key: string]: any;
  creation_date?: string;
}

const validator = (req: Request, res: Response, next: NextFunction): void => {
  const body = req.body as RequestBody;

  // No creation date is allowed to pass through
  if (body.creation_date) {
    delete body.creation_date;
  }

  const creationDate = new Date().toJSON().slice(0, 10);
  body.creation_date = creationDate;

  try {
    for (const [key, value] of Object.entries(body)) {
      if (value === '') {
        body[key] = null;
      }
    }

    next();
  } catch (error) {
    logger.error(error);
    res.status(badRequest).json({ error: 'Bad request' });
  }
};

export default validator; 