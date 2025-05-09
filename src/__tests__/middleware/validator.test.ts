import validator from '../../middleware/validator';

describe('Validator Middleware', () => {
  const mockRequest = () => {
    return {
      body: {},
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
    jest.clearAllMocks();
  });

  it('should remove existing creation_date and set new one', () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      creation_date: '2023-01-01',
      name: 'Test',
    };

    validator(req, res, nextFunction);

    expect(req.body.creation_date).not.toBe('2023-01-01');
    expect(req.body.creation_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should convert empty strings to null', () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {
      name: '',
      description: 'Test description',
      emptyField: '',
    };

    validator(req, res, nextFunction);

    expect(req.body.name).toBeNull();
    expect(req.body.description).toBe('Test description');
    expect(req.body.emptyField).toBeNull();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle empty body', () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = {};

    validator(req, res, nextFunction);

    expect(req.body.creation_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle error and return 400', () => {
    const req = mockRequest();
    const res = mockResponse();
    req.body = null; // This will cause an error when trying to iterate

    validator(req, res, nextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad request' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
}); 