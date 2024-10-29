import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';
import Candidate from '../../schemas/Candidate.js';
import populateDb from '../db/testPopulation.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Party from '../../schemas/Party.js';
import mockData from '../db/mockData.js';

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

describe('GET /api/v1/candidates', () => {
	beforeEach(() => jest.clearAllMocks());

	it('should return 200 OK and a list of all candidates when no query is given', async () => {
		const response = await request(app).get(baseRoute);
		expect(response.statusCode).toBe(200);
		expect(response.body).toHaveLength(mockData.candidates.length);
		response.body.forEach(candidate => {
			expect(candidate).toMatchObject({
				name: expect.any(String),
				party: expect.any(String),
				nominationDistrict: expect.any(String),
				_id: expect.any(String),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				__v: expect.any(Number),
			});
		});
	})

	it('should return 200 OK and a filtered list of candidates when valid query is given', async () => {
		const partyId = await Party.findOne().then(party => party._id);
		const candidateCount = await Candidate.find({ party: partyId }).countDocuments();
		const response = await request(app).get(baseRoute + '?party=' + partyId);
		console.log(response.body);
		expect(response.statusCode).toBe(200);
		expect(response.body).toHaveLength(candidateCount);
		response.body.forEach(candidate => {
			expect(candidate).toMatchObject({
				name: expect.any(String),
				party: partyId.toString(),
				nominationDistrict: expect.any(String),
				_id: expect.any(String),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				__v: expect.any(Number),
			});
		});
	});

	it('should return 400 Bad Request when an invalid query is given', async () => {
		const response = await request(app).get(baseRoute + '?invalidQuery=invalid');
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid query parameter: invalidQuery');
	});

	it('should return 400 Bad Request when an invalid ID is given in the query', async () => {
		const response = await request(app).get(baseRoute + '?party=invalidId');
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid ID: invalidId');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(Candidate, 'find').mockRejectedValueOnce(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementationOnce(() => { });
		const response = await request(app).get(baseRoute);
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('An unexpected error occurred while fetching candidates');
	});
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
		jest.clearAllMocks();
		candidate = await Candidate.findOne();
		party = await Party.findOne();
		nominationDistrict = await NominationDistrict.findOne();
	});

	const testUpdateCandidate = async (candidateId, fields, expectedStatus, expectedBody) => {
		const response = await request(app).patch(`${baseRoute}/${candidateId}`).send(fields);
		expect(response.statusCode).toBe(expectedStatus);
		expect(response.body).toEqual(expectedBody);
	};

	const successBody = (candidate) => {
		return {
			message: 'Candidate updated successfully',
			candidate: expect.objectContaining({
				name: 'John Doe',
				party: party._id.toString(),
				nominationDistrict: nominationDistrict._id.toString(),
				_id: candidate._id.toString(),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				__v: expect.any(Number),
			})
		};
	};

	it('should return 200 OK when updating a candidate', async () => {
		await testUpdateCandidate(candidate._id, {
			name: 'John Doe',
			party: party._id,
			nominationDistrict: nominationDistrict._id,
		}, 200, successBody(candidate));
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

	it('should return 400 Bad Request when candidate fields are invalid (3)', async () => {
		await testInvalidCandidateFields(
			{
				name: 'Jo',
				party: party._id,
				nominationDistrict: nominationDistrict._id,
			},
			{
				name: 'Name must be longer than 2 characters.',
			}
		);
	});

	it('should ignore invalid fields in the request body', async () => {
		await testUpdateCandidate(candidate._id, {
			name: 'John Doe',
			party: party._id,
			nominationDistrict: nominationDistrict._id,
			invalidField: 'invalid',
		}, 200, successBody(candidate));
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(Candidate, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementationOnce(() => { });
		const response = await request(app).patch(`${baseRoute}/${candidate._id}`).send({
			name: 'John Doe',
			party: party._id,
			nominationDistrict: nominationDistrict._id,
		});

		expect(response.body.error).toBe('An unexpected error occurred while updating candidate');
		expect(response.statusCode).toBe(500);
	});
});

describe('DELETE /api/v1/candidates/:id', () => {
	let candidate;
	beforeEach(async () => {
		jest.clearAllMocks();
		candidate = await Candidate.findOne();
	});

	it('should return 200 OK when deleting a candidate', async () => {
		const response = await request(app).delete(`${baseRoute}/${candidate._id}`);
		expect(response.statusCode).toBe(200);
		expect(response.body.message).toBe('Candidate deleted successfully');
		expect(response.body.candidate).toMatchObject({
			name: candidate.name,
			party: candidate.party.toString(),
			nominationDistrict: candidate.nominationDistrict.toString(),
			_id: candidate._id.toString(),
			createdAt: candidate.createdAt.toISOString(),
			updatedAt: candidate.updatedAt.toISOString(),
			__v: candidate.__v,
		});
	});

	it('should return 204 Not Found when candidate does not exist', async () => {
		const candidateId = new mongoose.Types.ObjectId();
		const response = await request(app).delete(`${baseRoute}/${candidateId}`);
		expect(response.statusCode).toBe(204);
	});

	it('should return 400 Bad Request when candidate ID format is invalid', async () => {
		const response = await request(app).delete(`${baseRoute}/invalidId`);
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('\'' + 'invalidId' + '\' (type string) is not a valid ObjectId');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(Candidate, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementationOnce(() => { });
		const response = await request(app).delete(`${baseRoute}/${candidate._id}`);
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('An unexpected error occurred while deleting candidate');
	});
});

afterAll(async () => {
	await mongoose.connection.close();
	server.close();
});