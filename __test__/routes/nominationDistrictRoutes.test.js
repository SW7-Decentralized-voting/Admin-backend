import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';
import mockData from '../db/mockData.js';
import populateDb from '../db/testPopulation.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Constituency from '../../schemas/Constituency.js';

let router;
const baseRoute = '/api/v1/nominationDistricts';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
	connectDb();
	router = (await import('../../routes/nominationDistrictRoutes.js')).default;

	await populateDb();
});

jest.unstable_mockModule('../../middleware/verifyToken.js', () => {
	return {
		auth: jest.fn((req, res, next) => next()),
	};
});

describe('GET /', () => {
	it('should return all nomination districts if no query is given', async () => {
		const res = await request(app).get(baseRoute);
		expect(res.statusCode).toEqual(200);
		expect(res.body.length).toBe(mockData.nominationDistricts.length);
		res.body.forEach((nominationDistrict) => {
			expect(nominationDistrict).toMatchObject({
				name: expect.any(String),
				constituency: expect.any(String),
			});
		});
	});

	it('should return a filtered list of nomination districts if a valid query is given', async () => {
		const constituencyId = await Constituency.findOne().then((constituency) => constituency._id);
		const res = await request(app).get(`${baseRoute}?constituency=${constituencyId.toString()}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toMatchObject({
			name: expect.any(String),
			constituency: expect.any(String),
		});
	});

	it('should return an empty list if no nomination districts match the query', async () => {
		const res = await request(app).get(`${baseRoute}?name=NonExistentNominationDistrict`);
		expect(res.statusCode).toEqual(200);
		expect(res.body.length).toBe(0);
	});

	it('should return a 500 error if an unexpected error occurs', async () => {
		jest.spyOn(mongoose.Model, 'find').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => {});
		const res = await request(app).get(baseRoute);
		expect(res.statusCode).toEqual(500);
		expect(res.body).toMatchObject({
			error: 'An unexpected error occurred while fetching nomination districts',
		});
	});
});

afterAll(async () => {
	await mongoose.connection.close();
	server.close();
});
