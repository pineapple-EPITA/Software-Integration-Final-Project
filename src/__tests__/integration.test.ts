import request from 'supertest';
import { app } from '../boot/setup';

describe('Integration Tests', () => {
  it('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('GET /users (unauthenticated) should return 200 OK', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
  });

  it('GET /messages without token should return 401', async () => {
    const response = await request(app).get('/messages');
    expect(response.status).toBe(401);
  });

  it('GET /unknown-route should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});
