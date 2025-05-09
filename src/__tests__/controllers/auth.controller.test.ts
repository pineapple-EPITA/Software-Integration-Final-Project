import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Response } from 'express';
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

describe('Auth Controller', () => {
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = createMockRequest({
      user: { email: 'test@example.com', _id: '123' }
    });
    mockResponse = createMockResponse();
    responseObject = {};
    process.env.JWT_SECRET_KEY = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const userData: UserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        ...userData,
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const UserMock = User as unknown as jest.Mock;
      UserMock.mockImplementation(() => mockUser);

      await signup(mockRequest as CustomRequest, mockResponse as Response);

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
      const userData: UserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockResolvedValue(userData);

      await signup(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User already exists',
      });
    });

    it('should handle database errors during signup', async () => {
      const userData: UserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

      await signup(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error creating user',
      });
    });
  });

  describe('signin', () => {
    it('should return error if user not found', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await signin(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should return error if password is incorrect', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      const mockUser: UserData = {
        _id: new mongoose.Types.ObjectId(),
        ...userData,
        password: 'hashedPassword',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await signin(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should sign in successfully and return token', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      const mockUser: UserData = {
        _id: new mongoose.Types.ObjectId(),
        ...userData,
        password: 'hashedPassword',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await signin(mockRequest as CustomRequest, mockResponse as Response);

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
      const userData: UserData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

      await signin(mockRequest as CustomRequest, mockResponse as Response);

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

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(userData),
      } as any);

      mockRequest.user = { email: userData.email, _id: userData._id.toString() };

      await getUser(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: userData,
      });
    });

    it('should return error if user not found', async () => {
      mockRequest.user = { email: 'test@example.com', _id: '123' };

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as any);

      await getUser(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });
  });

  describe('logout', () => {
    it('should clear session and return success message', async () => {
      await logout(mockRequest as CustomRequest, mockResponse as Response);

      expect(mockRequest.session?.destroy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
}); 