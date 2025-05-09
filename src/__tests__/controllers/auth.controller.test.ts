import { jest } from '@jest/globals';
import { Session, Cookie } from 'express-session';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { signup, signin, getProfile, logout } from '../../controllers/auth.controller';
import User from '../../models/userModel';
import { createMockRequest, createMockResponse } from '../utils';
import { statusCodes } from '../../constants/statusCodes';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/userModel');

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
  destroy?: (callback?: (err: any) => void) => UserSession;
}

interface CustomRequestWithBody extends Request {
  body: AuthRequestBody;
  session: UserSession;
  user?: {
    email: string;
    _id: string;
  };
}

describe('Auth Controller', () => {
  let mockRequest: CustomRequestWithBody;
  let mockResponse: Response;

  beforeEach(() => {
    mockRequest = {
      body: { email: 'test@example.com', password: 'password123' },
      session: {
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
        user: { email: 'test@example.com', _id: '123' },
        destroy: jest.fn((callback?: (err: any) => void) => {
          if (callback) callback(null);
          return mockRequest.session;
        })
      },
      user: { email: 'test@example.com', _id: '123' }
    } as unknown as CustomRequestWithBody;

    mockResponse = createMockResponse();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      const mockSave = jest.fn().mockResolvedValue({});
      (User.prototype.save as jest.Mock) = mockSave;

      await signup(mockRequest, mockResponse);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hashSync).toHaveBeenCalledWith(userData.password, 10);
      expect(mockSave).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.created);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
      });
    });

    it('should return error if user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      (User.findOne as jest.Mock).mockResolvedValue({ email: userData.email });

      await signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.badRequest);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email already registered',
      });
    });

    it('should handle database errors during signup', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.serverError);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error registering user',
      });
    });
  });

  describe('signin', () => {
    it('should return error if user not found', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.unauthorized);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should return error if password is incorrect', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: userData.email,
        password: 'hashedPassword',
      };

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser)
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.unauthorized);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should sign in successfully and return token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: userData.email,
        username: 'testuser',
        password: 'hashedPassword',
      };

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser)
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.ok);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'test-token',
        user: {
          _id: mockUser._id,
          email: mockUser.email,
          username: mockUser.username
        },
      });
    });

    it('should handle database errors during signin', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      (User.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.serverError);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error signing in',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user data if authenticated', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        messages: [],
      };

      (User.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser)
      });

      await getProfile(mockRequest, mockResponse);

      expect(User.findById).toHaveBeenCalledWith(
        mockRequest.session.user?._id,
        { password: 0, __v: 0 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.ok);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUser,
      });
    });

    it('should return error if user not found', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      await getProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.notFound);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });
  });

  describe('logout', () => {
    it('should clear session and return success message', async () => {
      await logout(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.success);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
}); 