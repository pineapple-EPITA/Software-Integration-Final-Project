import { Response } from 'express';
import { Session } from 'express-session';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserModel from '../models/userModel';
import { statusCodes } from '../constants/statusCodes';
import logger from '../middleware/winston';
import { CustomRequest } from '../types/express';

interface AuthRequestBody {
  username?: string;
  email?: string;
  password?: string;
}

interface UserSession extends Session {
  user?: {
    email: string;
    _id: string;
  };
}

interface CustomRequestWithBody extends CustomRequest {
  body: AuthRequestBody;
  session: UserSession;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const signup = async (req: CustomRequestWithBody, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !password || !email) {
    res.status(statusCodes.badRequest).json({ error: 'Missing information' });
    return;
  }

  if (!validateEmail(email)) {
    res.status(statusCodes.badRequest).json({ error: 'Invalid email format' });
    return;
  }

  if (password.length < 6) {
    res.status(statusCodes.badRequest).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  if (username.length < 3) {
    res.status(statusCodes.badRequest).json({ error: 'Username must be at least 3 characters long' });
    return;
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(statusCodes.badRequest).json({ error: 'Email already registered' });
      return;
    }

    const hash = bcrypt.hashSync(password, 10);

    const User = new UserModel({
      email,
      username,
      password: hash,
    });
    const user = await User.save();
    res.status(statusCodes.success).json(user);
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Failed to save user' });
  }
};

export const signin = async (req: CustomRequestWithBody, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(statusCodes.badRequest).json({ error: 'Missing information' });
    return;
  }

  if (!validateEmail(email)) {
    res.status(statusCodes.badRequest).json({ error: 'Invalid email format' });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(statusCodes.badRequest).json({ message: 'User not found' });
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.status(statusCodes.badRequest).json({ message: "Email or password don't match" });
      return;
    }

    req.session.user = {
      email: user.email,
      _id: user._id.toString(),
    };

    const token = jwt.sign(
      { user: { id: user._id, email: user.email } },
      process.env.JWT_SECRET_KEY || '',
      {
        expiresIn: '1h',
      },
    );

    res.status(statusCodes.success).json({ token });
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Failed to get user' });
  }
};

export const getUser = async (req: CustomRequestWithBody, res: Response): Promise<void> => {
  if (!req.session.user) {
    res.status(statusCodes.unauthorized).json({ error: 'You are not authenticated' });
    return;
  }

  try {
    const user = await UserModel
      .findById(req.session.user._id, {
        password: 0,
      })
      .populate('messages');

    if (!user) {
      res.status(statusCodes.badRequest).json({ message: 'User not found' });
      return;
    }

    res.status(statusCodes.success).json(user);
  } catch (error) {
    logger.error(error instanceof Error ? error.stack : 'Unknown error');
    res.status(statusCodes.queryError).json({ error: 'Failed to get user' });
  }
};

export const logout = (req: CustomRequestWithBody, res: Response): void => {
  if (req.session.user) {
    delete req.session.user;
  }

  res.status(statusCodes.success).json({ message: 'Disconnected' });
}; 