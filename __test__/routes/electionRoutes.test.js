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
	}
});

describe('POST /api/v1/elections/start', () => {
	it('should return 200 OK when starting an election', async () => {
		const spy = jest.spyOn(axios, 'post').mockResolvedValue({ data: { message: 'Election started successfully' } });
		const response = await request(app).post(`${baseRoute}/start`);
		expect(response.statusCode).toBe(200);
		expect(response.body.message).toBe('Election started successfully');
		expect(spy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ candidates: expect.any(Array), parties: expect.any(Array) }));
	});

	it('should return 400 Bad Request when starting an election that has already started', async () => {
		const spy = jest.spyOn(axios, 'post').mockRejectedValue({ response: { status: 400, data: { error: 'Election has already started' } } });
		const response = await request(app).post(`${baseRoute}/start`);
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Election has already started');
		expect(spy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ candidates: expect.any(Array), parties: expect.any(Array) }));
	});

	it('should return 500 Internal Server Error when starting an election fails', async () => {
		const spy = jest.spyOn(axios, 'post').mockRejectedValue({ response: { status: 500, data: { error: 'Internal server error' } } });
		const response = await request(app).post(`${baseRoute}/start`);
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('Internal server error');
		expect(spy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ candidates: expect.any(Array), parties: expect.any(Array) }));
	});

	it('should return 500 Internal Server Error when blockchain service is unreachable', async () => {
		const spy = jest.spyOn(axios, 'post').mockRejectedValue({ response: { status: 404 } });
		const response = await request(app).post(`${baseRoute}/start`);
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('Blockchain service cannot be reached');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		const spy = jest.spyOn(axios, 'post').mockRejectedValue({ response: { status: 503, data: { error: 'Unknown error' } } });
		const response = await request(app).post(`${baseRoute}/start`);
		expect(response.statusCode).toBe(503);
		expect(response.body.error).toBe("Unknown error");
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