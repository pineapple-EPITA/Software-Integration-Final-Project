import dotenv from 'dotenv';
import path from 'path';
import request from 'supertest';
import type { Application } from 'express';
import { createApp } from '../boot/setup';

let app: Application;

beforeAll(async () => {
  app = await createApp();
});

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// const app = createApp();

describe('Integration Tests', () => {
  it('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('POST /users/register with missing data should return 400', async () => {
    const res = await request(app).post('/users/register').send({}); // Empty body to simulate missing fields
    expect(res.status).toBe(400); // Adjust if your validation returns a different code
  });

  it('GET /messages without token should return 401', async () => {
    const response = await request(app).get('/messages');
    expect(response.status).toBe(401);
  });

  it('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});
