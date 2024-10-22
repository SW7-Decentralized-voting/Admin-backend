import request from 'supertest';
import express from 'express';
import mongoose, { mongo } from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';
import Party from '../../schemas/Party.js';
import mockData from '../db/mockData.js';

let router;
const baseRoute = '/api/v1/parties';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
	connectDb();
	await Party.insertMany(mockData.parties);
	router = (await import('../../routes/partyRoutes.js')).default;
});

jest.unstable_mockModule('../../middleware/verifyToken.js', () => {
	return {
		auth: jest.fn((req, res, next) => next()),
	}
});

const mongoDbFields = {
	_id: expect.any(String),
	createdAt: expect.any(String),
	updatedAt: expect.any(String),
	__v: expect.any(Number),
}

describe('POST /api/v1/parties', () => {
	it('should return 201 Created when party fields are valid', async () => {
		const response = await request(app).post(baseRoute).send({
			name: 'New Party',
			list: 'P',
		});
		expect(response.statusCode).toBe(201);
		expect(response.body.message).toBe('Party added successfully');
		expect(response.body.party).toMatchObject({
			name: 'New Party',
			list: 'P',
			...mongoDbFields,
		});
	});

	it('should return 400 Bad Request when party fields are missing (1)', async () => {
		const response = await request(app).post(baseRoute).send({});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			name: 'name is required',
			list: 'list is required',
		});
	});

	it('should return 400 Bad Request when party fields are missing (2)', async () => {
		const response = await request(app).post(baseRoute).send({
			name: 'New Party',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			list: 'list is required',
		});
	});

	it('should return 400 Bad Request when party fields are invalid (1)', async () => {
		const response = await request(app).post(baseRoute).send({
			name: 'New Party',
			list: 5,
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			list: 'List must be a one letter (uppercase) string.',
		});
	});

	it('should return 400 Bad Request when party fields are invalid (2)', async () => {
		const response = await request(app).post(baseRoute).send({
			name: 'New Party',
			list: 'invalid',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			list: 'List must be a one letter (uppercase) string.',
		});
	});

	it('should return 400 Bad Request when party fields are invalid (3)', async () => {
		const response = await request(app).post(baseRoute).send({
			name: 'Pa',
			list: 'A',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			name: 'Name must be longer than 2 characters.',
		});
	});

	it('should return 400 Bad Request when party fields are invalid (4)', async () => {
		const response = await request(app).post(baseRoute).send({
			name: 'New Party And A Lot Of Other Characters Making It Longer Than 100 Characters Which Is The Maximum Allowed',
			list: 'P',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			name: 'Name must be shorter than 100 characters.',
		});
	});

	it('should return 400 Bad Request when party fields are invalid (5)', async () => {
		const response = await request(app).post(baseRoute).send({
			name: {},
			list: 'P',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			name: '\'[object Object]\' (type Object) is not a valid string',
		});
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(Party.prototype, 'save').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => {});
		const response = await request(app).post(baseRoute).send({
			name: 'New Party',
			list: 'P',
		});
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('An unexpected error occurred while adding the party');
	});
});

afterAll(async () => {
	server.close();
	await Party.deleteMany();
	await mongoose.connection.close();
});
