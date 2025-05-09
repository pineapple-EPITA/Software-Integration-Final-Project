import request from 'supertest';
import express from 'express';
import type { Application } from 'express-serve-static-core';
import healthCheckRouter from '../../middleware/healthCheck';

describe('Health Check Middleware', () => {
    let app: Application;

    beforeEach(() => {
        app = express();
        app.use(healthCheckRouter);
    });

    it('should return 200 OK for health check endpoint', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    it('should return 404 for non-health check routes', async () => {
        const response = await request(app).get('/non-existent');
        expect(response.status).toBe(404);
    });
}); 