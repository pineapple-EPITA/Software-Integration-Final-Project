import jwt from 'jsonwebtoken';
import verifyToken from '../../middleware/authentication';

describe('Authentication Middleware', () => {
  const mockRequest = () => {
    return {
      header: jest.fn(),
    };
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const nextFunction = jest.fn();

  beforeEach(() => {
    process.env.JWT_SECRET_KEY = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', () => {
    const req = mockRequest();
    const res = mockResponse();
    req.header.mockReturnValue(null);

    verifyToken(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', () => {
    const req = mockRequest();
    const res = mockResponse();
    req.header.mockReturnValue('invalid-token');

    verifyToken(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    const req = mockRequest();
    const res = mockResponse();
    req.header.mockReturnValue('Bearer invalid-token');

    verifyToken(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should set user in request and call next() if token is valid', () => {
    const user = { id: '123', email: 'test@example.com' };
    const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY);
    const req = mockRequest();
    const res = mockResponse();
    req.header.mockReturnValue(`Bearer ${token}`);

    verifyToken(req, res, nextFunction);

    expect(req.user).toEqual(user);
    expect(nextFunction).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
}); 