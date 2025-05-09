import { Request, Response } from 'express';
import notFound from '../../middleware/notFound';

describe('Not Found Middleware', () => {
  const mockRequest = (): Partial<Request> => {
    return {};
  };

  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 status with error message', () => {
    const req = mockRequest();
    const res = mockResponse();

    notFound(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Not Found',
      },
    });
  });
}); 