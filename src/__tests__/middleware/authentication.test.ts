import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { verifyToken } from '../../middleware/authentication';

interface CustomRequest extends Request {
  user?: {
    id?: string;
    email: string;
  };
}

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
      get: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    (mockRequest.header as jest.Mock).mockReturnValue(null);

    verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    (mockRequest.header as jest.Mock).mockReturnValue('Bearer invalid-token');

    // Create a JWT error that will be recognized as JsonWebTokenError
    const jwtError = new jwt.JsonWebTokenError('Invalid token');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw jwtError;
    });

    verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', () => {
    (mockRequest.header as jest.Mock).mockReturnValue('invalid-format');

    verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid token format',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() if token is valid', () => {
    const user = { id: '123', email: 'test@example.com' };
    (mockRequest.header as jest.Mock).mockReturnValue('Bearer valid-token');
    (jwt.verify as jest.Mock).mockReturnValue({
      user: user,
    });

    verifyToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual(user);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });
});
