import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';
import Candidate from '../../schemas/Candidate.js';
import populateDb from '../db/testPopulation.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Party from '../../schemas/Party.js';

let router;
const baseRoute = '/api/v1/candidates';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
	connectDb();
	router = (await import('../../routes/candidateRoutes.js')).default;

	await populateDb();
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
		jest.spyOn(console, 'error').mockImplementationOnce(() => { });
		const response = await request(app).post(baseRoute).send({
			name: 'John Doe',
			party: new mongoose.Types.ObjectId(),
			nominationDistrict: new mongoose.Types.ObjectId(),
		});

		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('An unexpected error occurred while adding candidate');
	});
});

describe('PATCH /api/v1/candidates/:id', () => {
	let candidate, party, nominationDistrict;
	beforeEach(async () => {
		jest.clearAllMocks()
		candidate = await Candidate.findOne();
		party = await Party.findOne();
		nominationDistrict = await NominationDistrict.findOne();
	});

	const testUpdateCandidate = async (candidateId, fields, expectedStatus, expectedBody) => {
		const response = await request(app).patch(`${baseRoute}/${candidateId}`).send(fields);
		expect(response.statusCode).toBe(expectedStatus);
		expect(response.body).toEqual(expectedBody);
	};

	it('should return 200 OK when updating a candidate', async () => {
		await testUpdateCandidate(candidate._id, {
			name: 'John Doe',
			party: party._id,
			nominationDistrict: nominationDistrict._id,
		}, 200, {
			message: 'Candidate updated successfully',
			candidate: expect.objectContaining({
				name: 'John Doe',
				party: party._id.toString(),
				nominationDistrict: nominationDistrict._id.toString(),
				_id: candidate._id.toString(),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				__v: expect.any(Number),
			}),
		});
	});

	it('should return 404 Not Found when candidate does not exist', async () => {
		const candidateId = new mongoose.Types.ObjectId();
		const response = await request(app).patch(`${baseRoute}/${candidateId}`).send({
			name: 'John Doe',
			party: party._id,
			nominationDistrict: nominationDistrict._id,
		});

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Candidate with id \'' + candidateId + '\' not found');
	});

	const testInvalidCandidateFields = async (fields, expectedErrors) => {
		const response = await request(app).patch(`${baseRoute}/${candidate._id}`).send(fields);
		console.log(response.body);
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
		jest.spyOn(Candidate, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementationOnce(() => { });
		const response = await request(app).patch(`${baseRoute}/${candidate._id}`).send({
			name: 'John Doe',
			party: party._id,
			nominationDistrict: nominationDistrict._id,
		});

		expect(response.statusCode).toBe(500);
		expect(response.body).toBe('An unexpected error occurred while updating candidate');
	});
});

afterAll(async () => {
	await mongoose.connection.close();
	server.close();
});