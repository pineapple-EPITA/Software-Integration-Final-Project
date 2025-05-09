import dotenv from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.dev') });

// Set test environment
process.env.NODE_ENV = 'test';

let mongoServer: MongoMemoryServer;

// Mock the pg Pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

// Mock the winston logger
jest.mock('../middleware/winston', () => ({
  info: jest.fn(),
  error: jest.fn(),
  stream: {
    write: jest.fn(),
  },
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Global test setup
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 