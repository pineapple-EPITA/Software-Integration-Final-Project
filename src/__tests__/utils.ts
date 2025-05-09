import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { CustomRequest, CustomRequestWithBody } from '../types/express';

export interface MockRequest extends Partial<Request> {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  user?: any;
  session?: any;
}

export interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
  sendStatus: jest.Mock;
  locals: Record<string, any>;
  headersSent: boolean;
  app: any;
  req: any;
  statusCode: number;
  links: jest.Mock;
  jsonp: jest.Mock;
  sendFile: jest.Mock;
  sendfile: jest.Mock;
  download: jest.Mock;
  contentType: jest.Mock;
  type: jest.Mock;
  format: jest.Mock;
  attachment: jest.Mock;
  append: jest.Mock;
  set: jest.Mock;
  header: jest.Mock;
  get: jest.Mock;
  clearCookie: jest.Mock;
  cookie: jest.Mock;
  location: jest.Mock;
  redirect: jest.Mock;
  render: jest.Mock;
  vary: jest.Mock;
  end: jest.Mock;
}

export const createMockRequest = (overrides: Partial<MockRequest> = {}): MockRequest => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  };
};

export const createMockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    locals: {},
    headersSent: false,
    app: {},
    req: {},
    statusCode: 200,
    links: jest.fn().mockReturnThis(),
    jsonp: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
    sendfile: jest.fn().mockReturnThis(),
    download: jest.fn().mockReturnThis(),
    contentType: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    attachment: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    location: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis(),
    vary: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };
  return res;
};

export const createMockNext = (): jest.Mock => {
  return jest.fn();
};

// Helper function to cast mock request to CustomRequest
export const castToCustomRequest = (req: MockRequest): CustomRequest => {
  return req as unknown as CustomRequest;
};

// Helper function to cast mock request to CustomRequestWithBody
export const castToCustomRequestWithBody = <T extends Record<string, unknown>>(req: MockRequest): CustomRequestWithBody<T> => {
  return req as unknown as CustomRequestWithBody<T>;
};

// Helper function to cast mock response to Response
export const castToResponse = (res: MockResponse): Response => {
  return res as unknown as Response;
};

export const mockPool = {
  query: jest.fn(),
  connect: jest.fn()
};

export const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  stream: {
    write: jest.fn()
  },
  default: {
    info: jest.fn(),
    error: jest.fn()
  }
};

export const mockRequest = (data: any = {}): Partial<Request> => {
  return {
    body: data,
    query: {},
    params: {},
    headers: {},
    ...data,
  };
};

export const mockResponse = (): MockResponse => {
  const res: MockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    locals: {},
    headersSent: false,
    app: {},
    req: {},
    statusCode: 200,
    links: jest.fn().mockReturnThis(),
    jsonp: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
    sendfile: jest.fn().mockReturnThis(),
    download: jest.fn().mockReturnThis(),
    contentType: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnThis(),
    attachment: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    location: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis(),
    vary: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };
  return res;
};

export const mockNext = jest.fn();

export const mockErrorHandler = (_err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(_err);
  res.status(500).json({ error: 'Internal Server Error' });
};

export const mockNotFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Not Found' });
};

export const mockValidationError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
};

export const mockDatabaseError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'DatabaseError';
  return error;
};

export const mockAuthenticationError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'AuthenticationError';
  return error;
};

export const mockAuthorizationError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'AuthorizationError';
  return error;
};

export const mockRequestValidationError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'RequestValidationError';
  return error;
};

export const mockResourceNotFoundError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'ResourceNotFoundError';
  return error;
};

export const mockConflictError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'ConflictError';
  return error;
};

export const mockRateLimitError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'RateLimitError';
  return error;
};

export const mockServiceUnavailableError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'ServiceUnavailableError';
  return error;
}; 