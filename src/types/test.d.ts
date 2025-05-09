import { Request } from 'express';
import { Session } from 'express-session';

export interface UserSession extends Session {
  user: {
    email: string;
    _id: string;
  };
}

export interface RatingRequestBody {
  rating: number;
}

export interface CustomRequest extends Request {
  session: UserSession;
  user: {
    email: string;
    _id: string;
  };
  params: {
    movieId?: string;
    messageId?: string;
    movie_id?: string;
    id?: string;
  };
  body: RatingRequestBody | any;
}

export interface CustomRequestWithBody<T> extends CustomRequest {
  body: T;
}

export interface CommentRequestBody {
  rating: number;
  username: string;
  comment: string;
  title: string;
}

export interface MessageRequestBody {
  message?: {
    name: string;
    content?: string;
  };
  name?: string;
}

export interface ProfileRequestBody {
  oldPassword?: string;
  newPassword?: string;
}