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

const mockError = (method) => {
	jest.spyOn(NominationDistrict, method).mockRejectedValue(new Error('Unexpected error'));
	jest.spyOn(console, 'error').mockImplementation(() => { });
}

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

	it('should return a 400 error if an invalid query is given', async () => {
		const res = await request(app).get(`${baseRoute}?invalidQuery=InvalidValue`);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toMatchObject({
			error: 'Invalid query parameter: invalidQuery',
		});
	});

	it('should return a 400 error if an invalid ID is given', async () => {
		const res = await request(app).get(`${baseRoute}?constituency=InvalidId`);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toMatchObject({
			error: 'Invalid ID: InvalidId',
		});
	});

	it('should return a 500 error if an unexpected error occurs', async () => {
		jest.spyOn(mongoose.Model, 'find').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => { });
		const res = await request(app).get(baseRoute);
		expect(res.statusCode).toEqual(500);
		expect(res.body).toMatchObject({
			error: 'An unexpected error occurred while fetching nomination districts',
		});
	});
});

describe('POST /', () => {
	it('should return 201 Created and the created nomination district if all fields are valid', async () => {
		const constituencyId = await Constituency.findOne().then((constituency) => constituency._id);
		const newNominationDistrict = {
			name: 'New Nomination District',
			constituency: constituencyId,
		};
		const res = await request(app).post(baseRoute).send(newNominationDistrict);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toMatchObject({
			message: 'Nomination district added successfully',
			nominationDistrict: {
				_id: expect.any(String),
				name: newNominationDistrict.name,
				constituency: newNominationDistrict.constituency.toString(),
			},
		});
	});

	it('should return a 400 error if fields are missing', async () => {
		const newNominationDistrict = {};
		const res = await request(app).post(baseRoute).send(newNominationDistrict);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toMatchObject({
			errors: {
				name: 'name is required',
				constituency: 'constituency is required',
			},
		})
	});

	const testInvalidFields = async (newNominationDistrict, expectedErrors) => {
		const res = await request(app).post(baseRoute).send(newNominationDistrict);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toMatchObject({ errors: expectedErrors });
	};

	it('should return a 400 error if fields are invalid (1)', async () => {
		const newNominationDistrict = {
			name: 'New Nomination District',
			constituency: 'InvalidId',
		};
		const expectedErrors = {
			constituency: '\'InvalidId\' (type string) is not a valid ObjectId',
		};
		await testInvalidFields(newNominationDistrict, expectedErrors);
	});

	it('should return a 400 error if fields are invalid (2)', async () => {
		const newNominationDistrict = {
			name: 'Ne',
			constituency: 'InvalidId',
		};
		const expectedErrors = {
			name: 'Name must be longer than 2 characters.',
			constituency: '\'InvalidId\' (type string) is not a valid ObjectId',
		};
		await testInvalidFields(newNominationDistrict, expectedErrors);
	});

	it('should return a 500 error if an unexpected error occurs', async () => {
		jest.spyOn(NominationDistrict.prototype, 'save').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => { });
		const newNominationDistrict = {
			name: 'New Nomination District',
			constituency: await Constituency.findOne().then((constituency) => constituency._id),
		};
		const res = await request(app).post(baseRoute).send(newNominationDistrict);
		expect(res.statusCode).toEqual(500);
		expect(res.body).toMatchObject({
			error: 'An unexpected error occurred while adding nomination district',
		});
	});

});

describe('PATCH /:id', () => {
	it('should return 200 OK and the updated nomination district if the ID and body is valid', async () => {
		const nominationDistrictId = await NominationDistrict.findOne().then((nominationDistrict) => nominationDistrict._id);
		const updatedNominationDistrict = {
			name: 'Updated Nomination District',
		};
		const res = await request(app).patch(`${baseRoute}/${nominationDistrictId}`).send(updatedNominationDistrict);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toMatchObject({
			message: 'Nomination district updated successfully',
			nominationDistrict: {
				_id: nominationDistrictId.toString(),
				name: updatedNominationDistrict.name,
				constituency: expect.any(String),
			},
		});
	});

	it('should return 400 Bad Request if the ID is invalid', async () => {
		const updatedNominationDistrict = {
			name: 'Updated Nomination District',
		};
		const res = await request(app).patch(`${baseRoute}/InvalidId`).send(updatedNominationDistrict);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toMatchObject({
			error: 'Invalid ID: InvalidId',
		});
	});

	it('should return 404 Not Found if the ID does not exist', async () => {
		const updatedNominationDistrict = {
			name: 'Updated Nomination District',
		};
		const res = await request(app).patch(`${baseRoute}/${new mongoose.Types.ObjectId()}`).send(updatedNominationDistrict);
		expect(res.statusCode).toEqual(404);
		expect(res.body).toMatchObject({
			error: 'Nomination district not found',
		});
	});

	const testInvalidPatchRequest = async (nominationDistrictId, updatedNominationDistrict, expectedErrors) => {
		const res = await request(app).patch(`${baseRoute}/${nominationDistrictId}`).send(updatedNominationDistrict);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toMatchObject({ errors: expectedErrors });
	};

	it('should return 400 Bad Request if the body is invalid (1)', async () => {
		const nominationDistrict = await NominationDistrict.findOne();
		const updatedNominationDistrict = {
			name: 'Ne',
		};
		const expectedErrors = {
			name: 'Name must be longer than 2 characters.',
		};
		await testInvalidPatchRequest(nominationDistrict._id, updatedNominationDistrict, expectedErrors);
	});

	it('should return 400 Bad Request if the body is invalid (2)', async () => {
		const nominationDistrictId = await NominationDistrict.findOne().then((nominationDistrict) => nominationDistrict._id);
		const updatedNominationDistrict = {
			name: 'Up',
			constituency: 'InvalidId',
		};
		const expectedErrors = {
			constituency: '\'InvalidId\' (type string) is not a valid ObjectId',
		};
		await testInvalidPatchRequest(nominationDistrictId, updatedNominationDistrict, expectedErrors);
	});

	it('should return 500 Internal Server Error if an unexpected error occurs', async () => {
		mockError('findByIdAndUpdate');
		const nominationDistrictId = await NominationDistrict.findOne().then((nominationDistrict) => nominationDistrict._id);
		const updatedNominationDistrict = {
			name: 'Updated Nomination District',
		};
		const res = await request(app).patch(`${baseRoute}/${nominationDistrictId}`).send(updatedNominationDistrict);
		expect(res.statusCode).toEqual(500);
		expect(res.body).toMatchObject({
			error: 'An unexpected error occurred while updating nomination district',
		});
	});
});

describe('DELETE /:id', () => {
	it('should return 200 OK and the deleted nomination district if the ID is valid', async () => {
		const nominationDistrictId = await NominationDistrict.findOne().then((nominationDistrict) => nominationDistrict._id);
		const res = await request(app).delete(`${baseRoute}/${nominationDistrictId}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toMatchObject({
			message: 'Nomination district deleted successfully',
			nominationDistrict: {
				_id: nominationDistrictId.toString(),
				name: expect.any(String),
				constituency: expect.any(String),
			},
		});
	});

	it('should return 400 Bad Request if the ID is invalid', async () => {
		const res = await request(app).delete(`${baseRoute}/InvalidId`);
		expect(res.statusCode).toEqual(400);
		expect(res.body).toMatchObject({
			error: 'Invalid ID: InvalidId',
		});
	});

	it('should return 204 No Content if no nominationDistrict is found', async () => {
		const res = await request(app).delete(`${baseRoute}/${new mongoose.Types.ObjectId()}`);
		expect(res.statusCode).toEqual(204);
		expect(res.body).toMatchObject({});
	});

	it('should return 500 Internal Server Error if an unexpected error occurs', async () => {
		mockError('findByIdAndDelete');
		const nominationDistrictId = await NominationDistrict.findOne().then((nominationDistrict) => nominationDistrict._id);
		const res = await request(app).delete(`${baseRoute}/${nominationDistrictId}`);
		expect(res.statusCode).toEqual(500);
		expect(res.body).toMatchObject({
			error: 'An unexpected error occurred while deleting nomination district',
		});
	});
});

afterAll(async () => {
	await mongoose.connection.db.dropDatabase();
	await mongoose.connection.close();
	server.close();
});
