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
	server.close();
	await Party.deleteMany();
	await mongoose.connection.close();
});
