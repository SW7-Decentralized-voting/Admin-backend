import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';
import mockData from '../db/mockData.js';
import populateDb from '../db/testPopulation.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Constituency from '../../schemas/Constituency.js';
import PollingStation from '../../schemas/PollingStation.js';

let router;
const baseRoute = '/api/v1/parties';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
	connectDb();
	await populateDb();
	router = (await import('../../routes/pollingStationRoutes.js')).default;
});

jest.unstable_mockModule('../../middleware/verifyToken.js', () => {
	return {
		auth: jest.fn((req, res, next) => next()),
	};
});

const mockError = (method) => {
	jest.spyOn(PollingStation, method).mockRejectedValue(new Error('Unknown error'));
	jest.spyOn(console, 'error').mockImplementation(() => { });
}

const testInvalidErrors = async (method, route, data, expectedErrors) => {
	const res = await request(app)[method](route).send(data);
	expect(res.status).toBe(400);
	expect(res.body.errors).toEqual(expectedErrors);
};

describe('GET /', () => {
	it('should return 200 OK and a list of all parties when no query is given', async () => {
		const res = await request(app).get(baseRoute);
		expect(res.status).toBe(200);
		expect(res.body.length).toBe(mockData.pollingStations.length);
		res.body.forEach((party) => {
			expect(party).toMatchObject({
				name: expect.any(String),
				_id: expect.any(String),
				nominationDistrict: expect.any(String),
				expectedVoters: expect.any(Number),
			});
		});
	});

	it('should return 200 OK and a list of polling stations filtered by name', async () => {
		const res = await request(app).get(baseRoute).query({ name: 'Polling Station 1' });
		expect(res.status).toBe(200);
		expect(res.body.length).toBe(1);
		expect(res.body[0].name).toBe('Polling Station 1');
	});

	it('should return 200 OK and a list of polling stations filtered by nomination district', async () => {
		const nominationDistrict = await NominationDistrict.findOne();
		const res = await request(app).get(baseRoute).query({ nominationDistrict: nominationDistrict._id.toString() });
		expect(res.status).toBe(200);
		expect(res.body.length).toBe(mockData.pollingStations.filter((station) => station.nominationDistrict === nominationDistrict.name).length);
		res.body.forEach((station) => {
			expect(station).toMatchObject({
				name: expect.any(String),
				_id: expect.any(String),
				nominationDistrict: nominationDistrict._id.toString(),
				expectedVoters: expect.any(Number),
			});
		});
	});

	it('should return 200 OK and an empty list if no polling stations match the query', async () => {
		const res = await request(app).get(baseRoute).query({ name: 'Invalid Polling Station' });
		expect(res.status).toBe(200);
		expect(res.body.length).toBe(0);
	});

	it('should return 400 Bad Request when an invalid query is given', async () => {
		const res = await request(app).get(baseRoute).query({ invalid: 'invalid' });
		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Invalid query parameter: invalid');
	});

	it('should return 400 Bad Request when an invalid _id is given', async () => {
		const res = await request(app).get(baseRoute).query({ _id: 'invalid' });
		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Invalid ID: invalid');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		mockError('find');
		const res = await request(app).get(baseRoute);
		expect(res.status).toBe(500);
		expect(res.body.error).toBe('An unexpected error occurred while fetching polling stations');
	});
});

describe('POST /', () => {
	it('should return 201 Created and the added polling station when a valid polling station is given', async () => {
		const nominationDistrict = await NominationDistrict.findOne();
		const res = await request(app).post(baseRoute).send({
			name: 'New Polling Station',
			nominationDistrict: nominationDistrict._id.toString(),
			expectedVoters: 100,
		});
		expect(res.status).toBe(201);
		expect(res.body.message).toBe('Polling station added successfully');
		expect(res.body.pollingStation).toMatchObject({
			name: 'New Polling Station',
			nominationDistrict: nominationDistrict._id.toString(),
			expectedVoters: 100,
			_id: expect.any(String),
		});
	});

	it('should return 400 Bad Request when a polling station with an invalid nomination district is given', async () => {
		const res = await request(app).post(baseRoute).send({
			name: 'Invalid Polling Station',
			nominationDistrict: 'invalid',
			expectedVoters: 100,
		});
		expect(res.status).toBe(400);
		expect(res.body.errors).toEqual({
			nominationDistrict: '\'invalid\' (type string) is not a valid ObjectId',
		});
	});

	it('should return 400 Bad Request when a polling station with a missing name is given', async () => {
		const res = await request(app).post(baseRoute).send({
			nominationDistrict: 'invalid',
			expectedVoters: 100,
		});
		expect(res.status).toBe(400);
		expect(res.body.errors).toEqual({
			nominationDistrict: '\'invalid\' (type string) is not a valid ObjectId',
			name: 'name is required',
		});
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(PollingStation.prototype, 'save').mockRejectedValue(new Error('Unknown error'));
		jest.spyOn(console, 'error').mockImplementation(() => { });
		const res = await request(app).post(baseRoute).send({
			name: 'New Polling Station',
			nominationDistrict: 'invalid',
			expectedVoters: 100,
		});
		expect(res.status).toBe(500);
		expect(res.body.error).toBe('An unexpected error occurred while adding polling station');
	});
});

describe('PATCH /:id', () => {
	it('should return 200 OK and the updated polling station when a valid polling station is given', async () => {
		const pollingStation = await PollingStation.findOne();
		const nominationDistrict = await NominationDistrict.findOne();
		const res = await request(app).patch(`${baseRoute}/${pollingStation._id}`).send({
			name: 'Updated Polling Station',
			nominationDistrict: nominationDistrict._id.toString(),
			expectedVoters: 100,
		});
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			message: 'Polling station updated successfully',
			pollingStation: {
				name: 'Updated Polling Station',
				nominationDistrict: nominationDistrict._id.toString(),
				expectedVoters: 100,
				_id: pollingStation._id.toString(),
			},
		});
	});

	it('should return 400 Bad Request when an invalid _id is given', async () => {
		const res = await request(app).patch(`${baseRoute}/invalid`).send({
			name: 'Updated Polling Station',
			nominationDistrict: 'invalid',
			expectedVoters: 100,
		});
		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Invalid ID: invalid');
	});

	it('should return 400 Bad Request when a polling station with an invalid nomination district is given', async () => {
		const pollingStation = await PollingStation.findOne();
		await testInvalidErrors('patch', `${baseRoute}/${pollingStation._id}`, {
			name: 'Updated Polling Station',
			nominationDistrict: 'invalid',
			expectedVoters: 100,
		}, {
			nominationDistrict: '\'invalid\' (type string) is not a valid ObjectId',
		});
	});

	it('should return 400 Bad Request when a polling station with a missing name is given', async () => {
		const pollingStation = await PollingStation.findOne();
		const res = await request(app).patch(`${baseRoute}/${pollingStation._id}`).send({
			nominationDistrict: 'invalid',
			expectedVoters: 100,
		});
		expect(res.status).toBe(400);
		expect(res.body.errors).toEqual({
			nominationDistrict: '\'invalid\' (type string) is not a valid ObjectId',
		});
	});

	it('should return 400 Bad Request when a polling station with an invalid name is given', async () => {
		const pollingStation = await PollingStation.findOne();
		const res = await request(app).patch(`${baseRoute}/${pollingStation._id}`).send({
			name: 'Up',
			expectedVoters: 100,
		});
		expect(res.status).toBe(400);
		expect(res.body.errors).toEqual({
			name: 'Name must be longer than 2 characters.',
		});
	});

	it('should return 404 Not Found when a non-existent polling station ID is given', async () => {
		const nominationDistrict = await NominationDistrict.findOne();
		const res = await request(app).patch(`${baseRoute}/${new mongoose.Types.ObjectId()}`).send({
			name: 'Updated Polling Station',
			nominationDistrict: nominationDistrict._id.toString(),
			expectedVoters: 100,
		});
		console.log(res.body);
		expect(res.status).toBe(404);
		expect(res.body.error).toBe('Polling station not found');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		mockError('findByIdAndUpdate');
		const pollingStation = await PollingStation.findOne();
		const nominationDistrict = await NominationDistrict.findOne();
		const res = await request(app).patch(`${baseRoute}/${pollingStation._id}`).send({
			name: 'Updated Polling Station',
			nominationDistrict: nominationDistrict._id.toString(),
			expectedVoters: 100,
		});
		expect(res.status).toBe(500);
		expect(res.body.error).toBe('An unexpected error occurred while updating polling station');
	});
});

describe('DELETE /:id', () => {
	it('should return 200 OK and the deleted polling station when a valid polling station ID is given', async () => {
		const pollingStation = await PollingStation.findOne();
		const res = await request(app).delete(`${baseRoute}/${pollingStation._id}`);
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			message: 'Polling station deleted successfully',
			pollingStation: {
				name: pollingStation.name,
				nominationDistrict: pollingStation.nominationDistrict.toString(),
				expectedVoters: pollingStation.expectedVoters,
				_id: pollingStation._id.toString(),
			},
		});
	});

	it('should return 400 Bad Request when an invalid _id is given', async () => {
		const res = await request(app).delete(`${baseRoute}/invalid`);
		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Invalid ID: invalid');
	});

	it('should return 204 No Content when a non-existent polling station ID is given', async () => {
		const res = await request(app).delete(`${baseRoute}/${new mongoose.Types.ObjectId()}`);
		expect(res.status).toBe(204);
		expect(res.body).toEqual({});
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		mockError('findByIdAndDelete');
		const pollingStation = await PollingStation.findOne();
		const res = await request(app).delete(`${baseRoute}/${pollingStation._id}`);
		expect(res.status).toBe(500);
		expect(res.body.error).toBe('An unexpected error occurred while deleting polling station');
	});
});


afterAll(async () => {
	server.close();
	await mongoose.connection.close();
});