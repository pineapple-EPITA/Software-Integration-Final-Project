import request from 'supertest';
import express, { Express } from 'express';
import healthCheck from '../../middleware/healthCheck';

describe('Health Check Middleware', () => {
    let app: Express;

    beforeEach(() => {
        app = express();
        app.use(healthCheck);
    });

    it('should return 200 status with health message', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'All up and running !!',
        });
    });

    it('should return 404 for non-health check routes', async () => {
        const response = await request(app).get('/api/other');

        expect(response.status).toBe(404);
    });
}); 