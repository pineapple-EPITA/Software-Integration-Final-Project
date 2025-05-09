import '@types/jest';
import { Request, Response } from 'express';

declare global {
  const jest: typeof import('@types/jest');
  const describe: jest.Describe;
  const it: jest.It;
  const expect: jest.Expect;
  const beforeEach: jest.BeforeEach;
  const afterEach: jest.AfterEach;
  const beforeAll: jest.BeforeAll;
  const afterAll: jest.AfterAll;
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
}

export interface MockRequest extends Partial<Request> {
  body?: any;
  params?: any;
  query?: any;
  user?: any;
  session?: any;
  header?: jest.Mock;
}

export interface MockPool {
  query: jest.Mock;
  connect: jest.Mock;
}

export interface MockClient {
  query: jest.Mock;
  release: jest.Mock;
} 