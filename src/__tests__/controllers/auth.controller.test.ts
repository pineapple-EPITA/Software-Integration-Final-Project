import { jest } from '@jest/globals';
import { Session, Cookie } from 'express-session';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import type { Response } from 'express';
import { CustomRequest } from '../../types/test';
import { signup, signin, getUser, logout } from '../../controllers/auth.controller';
import User from '../../models/userModel';
import { createMockRequest, createMockResponse } from '../utils';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

interface UserData {
  _id?: mongoose.Types.ObjectId;
  username?: string;
  email: string;
  password?: string;
  messages?: mongoose.Types.ObjectId[];
  save?: () => Promise<UserData>;
}

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

describe('Auth Controller', () => {
  let mockRequest: CustomRequestWithBody;
  let mockResponse: Response;

  beforeEach(() => {
    const mockSession: UserSession = {
      id: 'test-session-id',
      cookie: {
        maxAge: 3600000,
        originalMaxAge: 3600000,
        expires: new Date(),
        secure: false,
        httpOnly: true,
        path: '/',
        domain: undefined,
        sameSite: 'lax'
      } as Cookie,
      regenerate: function(callback: (err: any) => void): UserSession {
        callback(null);
        return this;
      },
      destroy: function(callback: (err: any) => void): UserSession {
        callback(null);
        return this;
      },
      reload: function(callback: (err: any) => void): UserSession {
        callback(null);
        return this;
      },
      save: function(callback?: (err: any) => void): UserSession {
        if (callback) callback(null);
        return this;
      },
      touch: function(): UserSession {
        return this;
      },
      resetMaxAge: function(): UserSession {
        return this;
      }
    };

    mockRequest = createMockRequest({
      user: { email: 'test@example.com', _id: '123' },
      body: { email: 'test@example.com', password: 'password123' },
      session: mockSession
    }) as CustomRequestWithBody;
    mockResponse = createMockResponse();
    process.env.JWT_SECRET_KEY = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const userData: AuthRequestBody = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');

      const mockUser: UserData = {
        _id: new mongoose.Types.ObjectId(),
        username: userData.username,
        email: userData.email || '',
        password: 'hashedPassword',
        save: jest.fn().mockImplementation(() => Promise.resolve(userData)) as () => Promise<UserData>,
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const UserMock = User as unknown as jest.Mock;
      UserMock.mockImplementation(() => mockUser);

      await signup(mockRequest, mockResponse);

      expect(User).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: 'hashedPassword',
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User created successfully',
      });
    });

    it('should return error if user already exists', async () => {
      const userData: AuthRequestBody = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockResolvedValue(userData);

      await signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User already exists',
      });
    });

    it('should handle database errors during signup', async () => {
      const userData: AuthRequestBody = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

      await signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error creating user',
      });
    });
  });

  describe('signin', () => {
    it('should return error if user not found', async () => {
      const userData: AuthRequestBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should return error if password is incorrect', async () => {
      const userData: AuthRequestBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      const mockUser: UserData = {
        _id: new mongoose.Types.ObjectId(),
        email: userData.email || '',
        password: 'hashedPassword',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should sign in successfully and return token', async () => {
      const userData: AuthRequestBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      const mockUser: UserData = {
        _id: new mongoose.Types.ObjectId(),
        email: userData.email || '',
        password: 'hashedPassword',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'test-token',
        user: {
          id: mockUser._id,
          email: mockUser.email,
        },
      });
    });

    it('should handle database errors during signin', async () => {
      const userData: AuthRequestBody = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error signing in',
      });
    });
  });

  describe('getUser', () => {
    it('should return user data if authenticated', async () => {
      const userData: UserData = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        messages: [],
      };

      const mockSelect = jest.fn().mockImplementation(() => Promise.resolve(userData));
      jest.spyOn(User, 'findById').mockReturnValue({
        select: mockSelect,
      } as any);

      mockRequest.user = { email: userData.email, _id: userData._id?.toString() || '' };

      await getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: userData,
      });
    });

    it('should return error if user not found', async () => {
      mockRequest.user = { email: 'test@example.com', _id: '123' };

      const mockSelect = jest.fn().mockImplementation(() => Promise.resolve(undefined));
      jest.spyOn(User, 'findById').mockReturnValue({
        select: mockSelect,
      } as any);

      await getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });
  });

  describe('logout', () => {
    it('should clear session and return success message', async () => {
      await logout(mockRequest, mockResponse);

      expect(mockRequest.session.destroy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
}); 