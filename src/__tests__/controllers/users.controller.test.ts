import jwt from 'jsonwebtoken';
import { register, login } from '../../controllers/users.controller';
import pool from '../../boot/database/db_connect';

jest.mock('jsonwebtoken');
jest.mock('../../boot/database/db_connect');
jest.mock('../../middleware/winston', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Users Controller', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockClient: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      session: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
    process.env.JWT_SECRET_KEY = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await register(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        country: 'Test Country',
        city: 'Test City',
        street: 'Test Street',
      };
      mockRequest.body = userData;

      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      await register(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User already has an account' });
    });

    it('should create new user and address successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        country: 'Test Country',
        city: 'Test City',
        street: 'Test Street',
        creation_date: '2024-02-20',
      };
      mockRequest.body = userData;

      mockClient.query
        .mockResolvedValueOnce({ rowCount: 0 }) // Check if user exists
        .mockResolvedValueOnce({ rowCount: 1 }) // Insert user
        .mockResolvedValueOnce({ rowCount: 1 }); // Insert address

      await register(mockRequest, mockResponse);

      expect(mockClient.query).toHaveBeenCalledTimes(4); // BEGIN, user insert, address insert, COMMIT
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User created' });
    });

    it('should handle database errors and rollback', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        country: 'Test Country',
        city: 'Test City',
        street: 'Test Street',
      };
      mockRequest.body = userData;

      mockClient.query
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockRejectedValueOnce(new Error('Database error'));

      await register(mockRequest, mockResponse);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Exception occurred while registering',
      });
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 404 if user credentials are incorrect', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (pool.query as jest.Mock).mockImplementation((query, params, callback) => {
        callback(null, { rows: [] });
      });

      await login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Incorrect email/password' });
    });

    it('should login successfully and return token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockRequest.body = userData;

      const mockUser = {
        email: 'test@example.com',
        username: 'testuser',
      };

      (pool.query as jest.Mock).mockImplementation((query, params, callback) => {
        callback(null, { rows: [mockUser] });
      });

      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await login(mockRequest, mockResponse);

      expect(mockRequest.session.user).toEqual({ email: mockUser.email });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'test-token',
        username: mockUser.username,
      });
    });

    it('should handle database errors during login', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (pool.query as jest.Mock).mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while logging in',
      });
    });
  });
}); 