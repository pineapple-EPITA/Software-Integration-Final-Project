import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.dev' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(() => {
});

afterAll(() => {

}); 