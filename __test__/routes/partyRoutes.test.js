import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
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
	await Party.deleteMany();
	await Party.insertMany(mockData.parties);
	router = (await import('../../routes/partyRoutes.js')).default;
});

jest.unstable_mockModule('../../middleware/verifyToken.js', () => {
	return {
		auth: jest.fn((req, res, next) => next()),
	};
});

const mongoDbFields = {
	_id: expect.any(String),
	createdAt: expect.any(String),
	updatedAt: expect.any(String),
	__v: expect.any(Number),
};

describe('GET /api/v1/parties', () => {
	const testGetParties = async (query, expectedStatus, expectedLength, expectedBody) => {
		const response = await request(app).get(`${baseRoute}${query}`);
		expect(response.statusCode).toBe(expectedStatus);
		expect(response.body.length).toBe(expectedLength);
		response.body.forEach((party, index) => {
			expect(party).toMatchObject(expectedBody[index]);
		});
	};

	it('should return 200 OK and all parties when no query is given', async () => {
		await testGetParties('', 200, mockData.parties.length, mockData.parties.map(party => ({
			...mongoDbFields,
			name: expect.any(String),
			list: expect.any(String),
		})));
	});

	it('should return 200 OK and filtered parties when a query is given', async () => {
		await testGetParties('?list=U', 200, 1, [{
			...mongoDbFields,
			name: expect.any(String),
			list: 'U',
		}]);
	});

	it('should return 200 OK and an empty array when no parties match the query', async () => {
		await testGetParties('?list=Z', 200, 0, []);
	});

	it('should return 400 Bad Request when an invalid query is given', async () => {
		const response = await request(app).get(`${baseRoute}?invalidQuery=invalid`);
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid query parameter: invalidQuery');
	});

	it('should return 400 Bad Request when an invalid ID is given', async () => {
		const response = await request(app).get(`${baseRoute}?_id=invalidId`);
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid ID: invalidId');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(Party, 'find').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => {});
		const response = await request(app).get(baseRoute);
		expect(response.statusCode).toBe(500);
		expect(response.body.error).toBe('An unexpected error occurred while fetching parties');
	});
});

describe('POST /api/v1/parties', () => {
	const testPostParty = async (partyData, expectedStatus, expectedBody) => {
		const response = await request(app).post(baseRoute).send(partyData);
		expect(response.statusCode).toBe(expectedStatus);
		expect(response.body).toMatchObject(expectedBody);
	};

	it('should return 201 Created when party fields are valid', async () => {
		await testPostParty({
			name: 'New Party',
			list: 'P',
		}, 201, {
			message: 'Party added successfully',
			party: {
				name: 'New Party',
				list: 'P',
				...mongoDbFields,
			},
		});
	});

	it('should return 400 Bad Request when party fields are missing', async () => {
		await testPostParty({}, 400, {
			errors: {
				name: 'name is required',
				list: 'list is required',
			},
		});
		await testPostParty({
			name: 'New Party',
		}, 400, {
			errors: {
				list: 'list is required',
			},
		});
	});

	const invalidPartyFields = [
		{
			data: { name: 'New Party', list: 5 },
			errors: { list: 'List must be a one letter (uppercase) string.' },
		},
		{
			data: { name: 'New Party', list: 'invalid' },
			errors: { list: 'List must be a one letter (uppercase) string.' },
		},
		{
			data: { name: 'Pa', list: 'A' },
			errors: { name: 'Name must be longer than 2 characters.' },
		},
		{
			data: { name: 'New Party And A Lot Of Other Characters Making It Longer Than 100 Characters Which Is The Maximum Allowed', list: 'P' },
			errors: { name: 'Name must be shorter than 100 characters.' },
		},
		{
			data: { name: {}, list: 'P' },
			errors: { name: '\'[object Object]\' (type Object) is not a valid string' },
		},
	];

	invalidPartyFields.forEach(({ data, errors }, index) => {
		it(`should return 400 Bad Request when party fields are invalid (${index + 1})`, async () => {
			await testPostParty(data, 400, { errors });
		});
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(Party.prototype, 'save').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => {});
		await testPostParty({
			name: 'New Party',
			list: 'P',
		}, 500, {
			error: 'An unexpected error occurred while adding the party',
		});
	});
});

describe('PATCH /api/v1/parties/:id', () => {
	let partyId;

	beforeAll(async () => {
			// Get a valid party ID from the mock data
			const party = await Party.findOne();
			partyId = party._id;
	});

	it('should return 200 OK when valid fields are provided', async () => {
			const response = await request(app).patch(`${baseRoute}/${partyId}`).send({
					name: 'Updated Party Name',
			});
			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe('Party updated successfully');
			expect(response.body.party).toMatchObject({
					name: 'Updated Party Name',
					...mongoDbFields,
			});
	});

	it('should return 400 Bad Request when neither name nor list are provided', async () => {
			const response = await request(app).patch(`${baseRoute}/${partyId}`).send({});
			expect(response.statusCode).toBe(400);
			expect(response.body.error).toBe('Please provide a name or list to update');
	});

	it('should return 400 Bad Request when invalid fields are present in the body', async () => {
			const response = await request(app).patch(`${baseRoute}/${partyId}`).send({
					name: 'Updated Party Name',
					invalidField: 'invalid',
			});
			expect(response.statusCode).toBe(400);
			expect(response.body.error).toBe('Invalid fields in the request body: invalidField');
	});

	it('should return 400 Bad Request when party ID format is invalid', async () => {
			const response = await request(app).patch(`${baseRoute}/invalidId`).send({
					name: 'Updated Party Name',
			});
			expect(response.statusCode).toBe(400);
			expect(response.body.error).toBe('Invalid party ID format');
	});

	it('should return 404 Not Found when party is not found', async () => {
			const nonExistentPartyId = new mongoose.Types.ObjectId(); // Generate a valid but non-existent ObjectId
			const response = await request(app).patch(`${baseRoute}/${nonExistentPartyId}`).send({
					name: 'Non-existent Party Name',
			});
			expect(response.statusCode).toBe(404);
			expect(response.body.error).toBe('Party not found');
	});

	it('should return 400 Bad Request when name is shorter than 2 characters', async () => {
			const response = await request(app).patch(`${baseRoute}/${partyId}`).send({
					name: 'a',
			});
			expect(response.statusCode).toBe(400);
			expect(response.body.errors).toEqual({
					name: 'Name must be longer than 2 characters.',
			});
	});

	it('should return 400 Bad Request when name is longer than 100 characters', async () => {
		const response = await request(app).patch(`${baseRoute}/${partyId}`).send({
				name: 'a'.repeat(101),
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
				name: 'Name must be shorter than 100 characters.',
		});
	});

	it('should return 400 Bad Request when list is more than one character', async () => {
		const response = await request(app).patch(`${baseRoute}/${partyId}`).send({
				list: 'abc',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
				list: 'List must be a one letter (uppercase) string.',
		});
	});

	it('should return 400 Bad Request when list is not one uppercase letter', async () => {
		const response = await request(app).patch(`${baseRoute}/${partyId}`).send({
				list: 'a',
		});
		expect(response.statusCode).toBe(400);
		expect(response.body.errors).toEqual({
				list: 'List must be a one letter (uppercase) string.',
		});
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
			jest.spyOn(Party, 'findByIdAndUpdate').mockRejectedValue(new Error('Unexpected error'));
			jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence error logging for this test
			const response = await request(app).patch(`${baseRoute}/${partyId}`).send({
					name: 'Updated Party Name',
			});
			expect(response.statusCode).toBe(500);
			expect(response.body.error).toBe('An unexpected error occurred while updating the party');
	});
});

describe('DELETE /api/v1/parties/:id', () => {
	let partyId;

	beforeAll(async () => {
			// Get a valid party ID from the mock data
			const party = await Party.findOne();
			partyId = party._id;
	});

	it('should return 200 OK when party is successfully deleted', async () => {
			const response = await request(app).delete(`${baseRoute}/${partyId}`);
			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe('Party deleted successfully');
			expect(response.body.party).toMatchObject({
					_id: partyId.toString(),
					...mongoDbFields,
			});
	});

	it('should return 204 Not Found when the party does not exist', async () => {
			const nonExistentPartyId = new mongoose.Types.ObjectId(); // Generate a valid but non-existent ObjectId
			const response = await request(app).delete(`${baseRoute}/${nonExistentPartyId}`);
			expect(response.statusCode).toBe(204);
			expect(response.body.error).toBeUndefined();
	});

	it('should return 400 Bad Request when party ID format is invalid', async () => {
			const response = await request(app).delete(`${baseRoute}/invalidId`);
			expect(response.statusCode).toBe(400);
			expect(response.body.error).toBe('Invalid party ID format');
	});

	it('should return 404 Bad Request when party ID is not present', async () => {
		const response = await request(app).delete(`${baseRoute}/`);
		expect(response.statusCode).toBe(404);
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
			jest.spyOn(Party, 'findByIdAndDelete').mockRejectedValue(new Error('Unexpected error'));
			jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence error logging for this test
			const response = await request(app).delete(`${baseRoute}/${partyId}`);
			expect(response.body.error).toBe('An unexpected error occurred while deleting the party');
			expect(response.statusCode).toBe(500);
	});
});

afterAll(async () => {
	await Party.deleteMany();
	await mongoose.connection.close();
	server.close();
});
