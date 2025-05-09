import notFound from '../../middleware/notFound';

describe('Not Found Middleware', () => {
  const mockRequest = () => {
    return {};
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const nextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 status with error message', () => {
    const req = mockRequest();
    const res = mockResponse();

    notFound(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Not Found',
      },
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
}); 