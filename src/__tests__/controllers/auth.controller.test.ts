import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { signup, signin, getUser, logout } from '../../controllers/auth.controller';
import User from '../../models/userModel';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      session: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.JWT_SECRET_KEY = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { username: 'testuser' };

      await signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should create a new user successfully', async () => {
      const userData = {
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
        save: jest.fn().mockResolvedValue({ ...userData, _id: new mongoose.Types.ObjectId() }),
      };

      jest.spyOn(User.prototype, 'save').mockResolvedValue(mockUser);

      await signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        username: userData.username,
        email: userData.email,
      }));
    });

    it('should handle database errors during signup', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(User.prototype, 'save').mockRejectedValue(new Error('Database error'));

      await signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'failed to save user' });
    });
  });

  describe('signin', () => {
    it('should return 400 if email or password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should return 400 if user is not found', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if password is incorrect', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await signin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Email or password don't match" });
    });

    it('should sign in successfully and return token', async () => {
      const userData = {
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(userData);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await signin(mockRequest, mockResponse);

      expect(mockRequest.session.user).toBeDefined();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ token: 'test-token' });
    });
  });

  describe('getUser', () => {
    it('should return 500 if user is not authenticated', async () => {
      await getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'You are not authenticated' });
    });

    it('should return user data if authenticated', async () => {
      const userId = new mongoose.Types.ObjectId();
      mockRequest.session.user = { _id: userId };

      const mockUser = {
        _id: userId,
        username: 'testuser',
        email: 'test@example.com',
        messages: [],
      };

      jest.spyOn(User, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      } as any);

      await getUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear session and return success message', () => {
      mockRequest.session.user = { _id: '123' };

      logout(mockRequest, mockResponse);

      expect(mockRequest.session.user).toBeUndefined();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Disconnected' });
    });
  });
}); 