import { Response } from 'express';
import { QueryResult } from 'pg';
import { CustomRequest } from '../../types/test';
import { editPassword, logout } from '../../controllers/profile.controller';
import { createMockRequest, createMockResponse, castToResponse } from '../utils';

// Mock the database connection at the top
jest.mock('../../boot/database/db_connect', () => ({
  query: jest.fn().mockImplementation((): Promise<any> => {
    return Promise.resolve({
      rows: [],
      command: 'SELECT',
      rowCount: 0,
      oid: 0,
      fields: []
    });
  }),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  removeListener: jest.fn(),
}));

interface UserRow {
  email: string;
  password: string;
}

type MockQueryResult = QueryResult<UserRow>;

// Create a mock pool with the minimum required functionality for our tests
const mockPool = jest.mocked(jest.requireMock('../../boot/database/db_connect'));

describe('Profile Controller', () => {
  let mockRequest: CustomRequest;
  let mockResponse: Response;

  beforeEach(() => {
    mockRequest = createMockRequest({
      user: { email: 'test@example.com', _id: '123' }
    }) as CustomRequest;
    mockRequest.session = {
      destroy: jest.fn((callback) => callback && callback())
    } as any;
    mockResponse = castToResponse(createMockResponse());
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('editPassword', () => {
    it('should return 400 if oldPassword or newPassword is missing', async () => {
      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing parameters',
      });
    });

    it('should return 400 if new password is same as old password', async () => {
      mockRequest.body = {
        oldPassword: 'password123',
        newPassword: 'password123',
      };

      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'New password cannot be equal to old password',
      });
    });

    it('should return 400 if new password is too short', async () => {
      mockRequest.body = {
        oldPassword: 'password123',
        newPassword: '12345',
      };

      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'New password must be at least 6 characters long',
      });
    });

    it('should return 400 if old password is incorrect', async () => {
      mockRequest.body = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      const mockResult: MockQueryResult = {
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      };
      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockResult);

      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Incorrect password',
      });
    });

    it('should update password successfully', async () => {
      mockRequest.body = {
        oldPassword: 'password123',
        newPassword: 'newpassword123',
      };

      const mockSelectResult: MockQueryResult = {
        rows: [{ email: 'test@example.com', password: 'hashed_password' }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      };
      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockSelectResult);

      const mockUpdateResult: MockQueryResult = {
        rows: [{ email: 'test@example.com', password: 'new_hashed_password' }],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: []
      };
      (mockPool.query as jest.Mock).mockResolvedValueOnce(mockUpdateResult);

      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password updated',
      });
    });

    it('should handle database errors', async () => {
      mockRequest.body = {
        oldPassword: 'password123',
        newPassword: 'newpassword123',
      };

      const dbError = new Error('Database error');
      (mockPool.query as jest.Mock).mockRejectedValueOnce(dbError);

      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while updating password',
      });
    });
  });

  describe('logout', () => {
    it('should clear user session and return success message', async () => {
      mockRequest.session = {
        user: { _id: '123' },
        destroy: jest.fn((callback) => callback()),
      } as any;

      await logout(mockRequest, mockResponse);

      expect(mockRequest.session.user).toBeUndefined();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Disconnected' });
    });

    it('should return success message even if no user session exists', async () => {
      await logout(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Disconnected' });
    });
  });
}); 