import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';
import Party from '../../schemas/Party.js';
import mockData from '../db/mockData.js';
import axios from 'axios';
import Candidate from '../../schemas/Candidate.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Constituency from '../../schemas/Constituency.js';
import { districtsWithIds, candidateWithIds } from '../db/addIds.js';

let router;
const baseRoute = '/api/v1/parties';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
	connectDb();
	await Party.insertMany(mockData.parties);
	await Constituency.insertMany(mockData.constituencies);
	await NominationDistrict.insertMany(await districtsWithIds(mockData.nominationDistricts));
	await Candidate.insertMany(await candidateWithIds(mockData.candidates));
	router = (await import('../../routes/electionRoutes.js')).default;
});

jest.unstable_mockModule('../../middleware/verifyToken.js', () => {
	return {
		auth: jest.fn((req, res, next) => next()),
	};
});

describe('POST /api/v1/elections/start', () => {
	 const testStartElection = async (expectedStatus, mockResponse, expectedMessage) => {
		const spy = jest.spyOn(axios, 'post').mockImplementation(() => {
			if (expectedStatus === 200) {
				return Promise.resolve(mockResponse);
			}
			return Promise.reject(mockResponse);
		});
		
		const response = await request(app).post(`${baseRoute}/start`);
	
		expect(response.statusCode).toBe(expectedStatus);
		if (expectedStatus === 200) {
			expect(response.body.message).toBe(expectedMessage);
		} else {
			expect(response.body.error).toBe(expectedMessage);
		}
		expect(spy).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ candidates: expect.any(Array), parties: expect.any(Array) })
		);
	};

	it('should return 200 OK when starting an election', async () => {
		await testStartElection(200, { status: 200, data: { message: 'Election started successfully' } }, 'Election started successfully');
	});

	it('should return 400 Bad Request when starting an election that has already started', async () => {
		await testStartElection(400, { response: { status: 400, data: { error: 'Election has already started' } } }, 'Election has already started');
	});

	it('should return 500 Internal Server Error when starting an election fails', async () => {
		await testStartElection(500, { response: { status: 500, data: { error: 'Unknown error' } } }, 'Unknown error');
	});

	it('should return 500 Internal Server Error when blockchain service is unreachable', async () => {
		await testStartElection(500, { response: { status: 500, data: { error: 'Blockchain service is unreachable' } } }, 'Blockchain service is unreachable');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(axios, 'post').mockRejectedValue({ response: { status: 500, data: { error: 'Unknown error' } } });
		const response = await request(app).post(`${baseRoute}/start`);
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('Unknown error');
	});

	it('should return 500 Internal Server Error when candidates or parties cannot be fetched', async () => {
		jest.spyOn(Candidate, 'find').mockRejectedValue(new Error('Database error'));
		const response = await request(app).post(`${baseRoute}/start`);
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('Database error');
	});
});

afterAll(async () => {
	server.close();
	await mongoose.connection.close();
});