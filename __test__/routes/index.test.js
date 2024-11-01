// Tests for /routes/index.js

import request from 'supertest';
import express from 'express';
import router from '../../routes/index.js'; // Adjust the import path to where your route is located
const baseRoute = '/api/v1';

const app = express();
app.use(express.json());
app.use(baseRoute, router);

const server = app.listen(0);

describe('GET /api/v1', () => {
	it('should return 200 OK', async () => {
		const response = await request(app).get(baseRoute);
		expect(response.statusCode).toBe(200);
	});
});

afterAll(() => {
	// You're my wonderwall
	server.close();
});