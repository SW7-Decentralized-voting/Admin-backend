import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';

let router;
const baseRoute = '/api/v1/candidates';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
	connectDb();
	router = (await import('../../routes/candidateRoutes.js')).default;
});

jest.unstable_mockModule('../../middleware/verifyToken.js', () => {
	return {
		auth: jest.fn((req, res, next) => next()),
	};
});


describe('POST /api/v1/candidates', () => {
	beforeEach(() => jest.clearAllMocks());

	it('should return 201 Created when candidate fields are valid', async () => {
		const partyId = new mongoose.Types.ObjectId();
		const nominationDistrictId = new mongoose.Types.ObjectId();
		const response = await request(app).post(baseRoute).send({
			name: 'John Doe',
			party: partyId,
			nominationDistrict: nominationDistrictId,
		});
		expect(response.statusCode).toBe(201);
		expect(response.body.message).toBe('Candidate added successfully');
		expect(response.body.candidate).toMatchObject({
			name: 'John Doe',
			party: partyId.toString(),
			nominationDistrict: nominationDistrictId.toString(),
			_id: expect.any(String),
			createdAt: expect.any(String), 
			updatedAt: expect.any(String),
			__v: expect.any(Number),
		});
	});

	it('should return 400 Bad Request when candidate fields are missing (1)', async () => {
		const response = await request(app).post(baseRoute).send({});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			name: 'name is required',
			party: 'party is required',
			nominationDistrict: 'nominationDistrict is required',
		});
	});

	it('should return 400 Bad Request when candidate fields are missing (2)', async () => {
		const response = await request(app).post(baseRoute).send({
			name: 'John Doe',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
			party: 'party is required',
			nominationDistrict: 'nominationDistrict is required',
		});
	});

	const testInvalidCandidateFields = async (fields, expectedErrors) => {
		const response = await request(app).post(baseRoute).send(fields);
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual(expectedErrors);
	};

	it('should return 400 Bad Request when candidate fields are invalid (1)', async () => {
		await testInvalidCandidateFields(
			{
				name: 'John Doe',
				party: 'invalid',
				nominationDistrict: 'invalid',
			},
			{
				party: '\'invalid\' (type string) is not a valid ObjectId',
				nominationDistrict: '\'invalid\' (type string) is not a valid ObjectId',
			}
		);
	});

	it('should return 400 Bad Request when candidate fields are invalid (2)', async () => {
		await testInvalidCandidateFields(
			{
				name: 'John Doe',
				party: 13542,
				nominationDistrict: 34889,
			},
			{
				party: '\'13542\' (type number) is not a valid ObjectId',
				nominationDistrict: '\'34889\' (type number) is not a valid ObjectId',
			}
		);
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(mongoose.Model.prototype, 'save').mockRejectedValueOnce(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementationOnce(() => {});
		const response = await request(app).post(baseRoute).send({
			name: 'John Doe',
			party: new mongoose.Types.ObjectId(),
			nominationDistrict: new mongoose.Types.ObjectId(),
		});

		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('An unexpected error occurred while adding candidate');
	});
});

afterAll(async () => {
	await mongoose.connection.close();
	server.close();
});