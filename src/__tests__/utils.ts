import { jest } from '@jest/globals';
import { Request } from 'express';
import { CustomRequest, UserSession } from '../types/test';

export const createMockRequest = (overrides: Partial<CustomRequest> = {}): Partial<CustomRequest> => {
  const defaultSession: Partial<UserSession> = {
    user: undefined,
    id: '123',
    cookie: {
      originalMaxAge: 24 * 60 * 60 * 1000,
      maxAge: 24 * 60 * 60 * 1000
    },
    regenerate: (cb) => {
      cb && cb(null);
      return defaultSession as UserSession;
    },
    destroy: (cb) => {
      cb && cb(null);
      return defaultSession as UserSession;
    },
    reload: (cb) => {
      cb && cb(null);
      return defaultSession as UserSession;
    },
    resetMaxAge: () => undefined,
    save: (cb) => {
      cb && cb(null);
      return defaultSession as UserSession;
    },
    touch: () => undefined
  };

  const defaultUser = overrides.user ? {
    email: overrides.user.email,
    _id: overrides.user._id || '123'
  } : undefined;

  return {
    body: {},
    session: {
      ...defaultSession,
      user: defaultUser,
      ...(overrides.session || {})
    } as UserSession,
    params: {},
    user: defaultUser,
    ...overrides,
  };
};

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  res.locals = {};
  res.headersSent = false;
  res.app = {};
  res.req = {};
  res.statusCode = 200;
  return res;
};

export const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  stream: {
    write: jest.fn(),
  },
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
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

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  res.locals = {};
  res.headersSent = false;
  res.app = {};
  res.req = {};
  res.statusCode = 200;
  return res;
};

export const mockNext = jest.fn(); 