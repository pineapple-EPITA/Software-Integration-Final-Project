import { Request, Response } from 'express';
import validator from '../../middleware/validator';
import { statusCodes } from '../../constants/statusCodes';

describe('Validator Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  const nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();
    mockResponse = {
      status: mockStatus,
      json: mockJson,
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

    // The current implementation only processes top-level fields
    expect(mockRequest.body.details.category).toBe('');
    expect(mockRequest.body.details.description).toBe('Test Description');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle arrays with empty strings', () => {
    mockRequest.body = {
      name: 'Test',
      tags: ['', 'tag1', '', 'tag2'],
    };

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    // The current implementation only processes top-level fields, not array items
    expect(mockRequest.body.tags).toEqual(['', 'tag1', '', 'tag2']);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle error during validation', () => {
    // Create a mock object that will throw an error during Object.entries iteration
    const proxyTarget = { test: 'value' };
    const proxyBody = new Proxy(proxyTarget, {
      get: (target, prop) => {
        // Allow normal access to properties
        return target[prop as keyof typeof target];
      },
      set: (target, prop, value) => {
        // Allow setting properties
        target[prop as keyof typeof target] = value;
        return true;
      },
      ownKeys: () => {
        // When Object.entries tries to get keys, throw an error
        throw new Error('Test error');
      }
    });

    mockRequest.body = proxyBody;

    validator(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockStatus).toHaveBeenCalledWith(statusCodes.badRequest);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Invalid request data',
      details: 'Test error',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
