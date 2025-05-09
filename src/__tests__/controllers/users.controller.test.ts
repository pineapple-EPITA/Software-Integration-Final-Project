import jwt from 'jsonwebtoken';
import { register, login } from '../../controllers/users.controller';
import pool from '../../boot/database/db_connect';

jest.mock('../../boot/database/db_connect', () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      await register(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 409 if user already exists', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        country: 'Test Country',
        city: 'Test City',
        street: 'Test Street',
      };

      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      await register(mockRequest, mockResponse);

      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1;',
        ['test@example.com']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User already has an account',
      });
    });

    it('should create user and address successfully', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        country: 'Test Country',
        city: 'Test City',
        street: 'Test Street',
        creation_date: new Date(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 1 });

      await register(mockRequest, mockResponse);

      expect(mockClient.query).toHaveBeenCalledTimes(4); // SELECT, BEGIN, INSERT user, INSERT address
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User created' });
    });

    it('should handle database errors and rollback transaction', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        country: 'Test Country',
        city: 'Test City',
        street: 'Test Street',
        creation_date: new Date(),
      };

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
      await login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 404 if user credentials are incorrect', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
        callback(null, { rows: [] });
      });

      await login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Incorrect email/password',
      });
    });

    it('should login successfully and return token', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'correctpassword',
      };

      const mockUser = {
        email: 'test@example.com',
        username: 'testuser',
      };

      (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
        callback(null, { rows: [mockUser] });
      });

      const mockToken = 'mock.jwt.token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      await login(mockRequest, mockResponse);

      expect(mockRequest.session.user).toEqual({ email: 'test@example.com' });
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: { email: 'test@example.com' } },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: mockToken,
        username: 'testuser',
      });
    });

    it('should handle database errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
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