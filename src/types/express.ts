import { Request } from 'express';

export interface CustomRequest extends Request {
  user?: {
    email: string;
    _id: string;
  };
} 