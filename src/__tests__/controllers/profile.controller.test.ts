import { editPassword, logout } from '../../controllers/profile.controller';
import pool from '../../boot/database/db_connect';

jest.mock('../../boot/database/db_connect', () => ({
  query: jest.fn(),
}));

describe('Profile Controller', () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      user: { email: 'test@example.com' },
      session: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('editPassword', () => {
    it('should return 400 if oldPassword or newPassword is missing', async () => {
      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 400 if oldPassword equals newPassword', async () => {
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

    it('should return 400 if old password is incorrect', async () => {
      mockRequest.body = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      (pool.query as jest.Mock).mockImplementation((query, params, callback) => {
        callback(null, { rows: [] });
      });

      await editPassword(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
        ['test@example.com', 'wrongpassword'],
        expect.any(Function)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Incorrect password' });
    });

    it('should update password successfully', async () => {
      mockRequest.body = {
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      };

      (pool.query as jest.Mock)
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { rows: [{ email: 'test@example.com' }] });
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { rows: [] });
        });

      await editPassword(mockRequest, mockResponse);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Password updated' });
    });

    it('should handle database errors during password verification', async () => {
      mockRequest.body = {
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      };

      (pool.query as jest.Mock).mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while updating password',
      });
    });

    it('should handle database errors during password update', async () => {
      mockRequest.body = {
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      };

      (pool.query as jest.Mock)
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { rows: [{ email: 'test@example.com' }] });
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(new Error('Database error'), null);
        });

      await editPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Exception occurred while updating password',
      });
    });
  });

  describe('logout', () => {
    it('should clear user session and return success message', async () => {
      mockRequest.session.user = { email: 'test@example.com' };

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