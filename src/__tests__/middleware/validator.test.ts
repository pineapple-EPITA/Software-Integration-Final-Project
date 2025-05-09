import { Request, Response } from 'express';
import validator from '../../middleware/validator';
import { statusCodes } from '../../constants/statusCodes';

describe('Validator Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add creation_date to request body', () => {
    const today = new Date().toJSON().slice(0, 10);
    mockRequest.body = {
      name: 'Test',
      description: 'Test Description',
    };

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.body.creation_date).toBe(today);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should override existing creation_date in request body', () => {
    const today = new Date().toJSON().slice(0, 10);
    mockRequest.body = {
      name: 'Test',
      description: 'Test Description',
      creation_date: '2020-01-01',
    };

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.body.creation_date).toBe(today);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should convert empty string values to null', () => {
    mockRequest.body = {
      name: '',
      description: 'Test Description',
      tags: '',
    };

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.body.name).toBeNull();
    expect(mockRequest.body.description).toBe('Test Description');
    expect(mockRequest.body.tags).toBeNull();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle nested objects with empty strings', () => {
    mockRequest.body = {
      name: 'Test',
      details: {
        category: '',
        description: 'Test Description',
      },
    };

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.body.details.category).toBeNull();
    expect(mockRequest.body.details.description).toBe('Test Description');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle arrays with empty strings', () => {
    mockRequest.body = {
      name: 'Test',
      tags: ['', 'tag1', '', 'tag2'],
    };

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.body.tags).toEqual([null, 'tag1', null, 'tag2']);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle error during validation', () => {
    // Create a body with a property that will throw an error when accessed
    Object.defineProperty(mockRequest.body, 'problematic', {
      get() {
        throw new Error('Test error');
      },
    });

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(statusCodes.badRequest);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid request data',
      details: 'Test error',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
}); 