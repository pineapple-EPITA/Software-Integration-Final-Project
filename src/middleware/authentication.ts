import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { unauthorized } from '../constants/statusCodes';
import logger from './winston';

interface DecodedToken {
  user: {
    email: string;
    [key: string]: any;
  };
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization');

  if (!token) {
    res.status(unauthorized).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET_KEY as string) as DecodedToken;
    req.user = decoded.user;

    console.log('TOKEN USER: ', req.user);
    next();
  } catch (error) {
    logger.error(error);
    res.status(unauthorized).json({ error: 'Invalid token' });
  }
};

export default verifyToken; 