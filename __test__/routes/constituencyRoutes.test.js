import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import connectDb from '../setup/connect.js';
import { jest } from '@jest/globals';
import populateDb from '../db/testPopulation.js';
import mockData from '../db/mockData.js';
import Constituency from '../../schemas/Constituency.js';

let router;
const baseRoute = '/api/v1/constituency';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
	connectDb();
	router = (await import('../../routes/constituencyRoutes.js')).default;

	await populateDb();
});

jest.unstable_mockModule('../../middleware/verifyToken.js', () => {
	return {
		auth: jest.fn((req, res, next) => next()),
	};
});

const mockError = (method) => {
	jest.spyOn(mongoose.Model, method).mockRejectedValue(new Error('Unexpected error'));
	jest.spyOn(console, 'error').mockImplementation(() => { });
};

describe('GET /api/v1/constituency', () => {
	it('should return 200 OK and all constituencies when no query is given', async () => {
		const response = await request(app).get(baseRoute);
		expect(response.status).toBe(200);
		expect(response.body).toHaveLength(mockData.constituencies.length);
		response.body.forEach((constituency) => {
			expect(constituency).toMatchObject({
				_id: expect.any(String),
				name: expect.any(String),
			});
		});
	});

	it('should return 200 OK and a list of constituencies that match the query', async () => {
		const constituency = mockData.constituencies[0];
		const response = await request(app).get(baseRoute).query({ name: constituency.name });
		expect(response.status).toBe(200);
		expect(response.body).toHaveLength(1);
		expect(response.body[0]).toMatchObject({
			_id: expect.any(String),
			name: constituency.name,
		});
	});

	it('should return 200 OK and an empty list when no constituencies match the query', async () => {
		const response = await request(app).get(baseRoute).query({ name: 'invalid' });
		expect(response.status).toBe(200);
		expect(response.body).toHaveLength(0);
	});

	it('should return 400 Bad Request when an invalid query is given', async () => {
		const response = await request(app).get(baseRoute + '?invalidQuery=invalid');
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid query parameter: invalidQuery');
	});

	it('should return 400 Bad Request when an invalid ID is given in the query', async () => {
		const response = await request(app).get(baseRoute + '?_id=invalidId');
		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid ID: invalidId');
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		jest.spyOn(mongoose.Model, 'find').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => { });
		const res = await request(app).get(baseRoute);
		expect(res.statusCode).toEqual(500);
		expect(res.body).toMatchObject({ error: 'An unexpected error occurred while fetching constituencies' });
	});
});

describe('POST /api/v1/constituency', () => {
  it('should return 201 Created and the created constituency when request is valid', async () => {
    const newConstituency = {
      name: 'New Constituency',
    };
    const response = await request(app).post(baseRoute).send(newConstituency);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      message: 'Constituency added successfully',
      constituency: {
        _id: expect.any(String),
        name: newConstituency.name,
      },
    });
  });

  it('should return 400 Bad Request when request is invalid', async () => {
    const response = await request(app).post(baseRoute).send({});
    expect(response.status).toBe(400);
    expect(response.body.errors).toMatchObject({
			name: 'name is required' 
		});
  });

  it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
    jest.spyOn(Constituency.prototype, 'save').mockRejectedValue(new Error('Unexpected error'));
		jest.spyOn(console, 'error').mockImplementation(() => { });
    const response = await request(app).post(baseRoute).send({ name: 'New Constituency' });
    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({ error: 'An unexpected error occurred while adding constituency' });
  });
});

describe('PATCH /api/v1/constituency/:id', () => {
  it('should return 200 OK and the updated constituency when request is valid', async () => {
    const constituency = await Constituency.findOne();
    const updatedName = 'Updated Constituency';
    const response = await request(app).patch(`${baseRoute}/${constituency._id.toString()}`).send({ name: updatedName });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: 'Constituency updated successfully',
      constituency: {
        _id: constituency._id.toString(),
        name: updatedName,
      },
    });
  });

  it('should return 400 Bad Request if the ID is invalid', async () => {
    const response = await request(app).patch(`${baseRoute}/invalid`).send({ name: 'Updated Constituency' });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Invalid ID: invalid' });
  });

	it('should return 400 Bad Request if the request is invalid', async () => {
		const constituency = await Constituency.findOne();
		const response = await request(app).patch(`${baseRoute}/${constituency._id.toString()}`).send({
			name: 'z',
		});
		expect(response.status).toBe(400);
		expect(response.body.errors).toMatchObject({
			name: 'Name must be longer than 2 characters.',
		});
	});

  it('should return 404 if the constituency ID is not found', async () => {
    const response = await request(app).patch(`${baseRoute}/${new mongoose.Types.ObjectId()}`).send({ name: 'Updated Constituency' });
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: 'Constituency not found' });
  });

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		mockError('findByIdAndUpdate');
		const response = await request(app).patch(`${baseRoute}/${new mongoose.Types.ObjectId()}`).send({ name: 'Updated Constituency' });
		expect(response.status).toBe(500);
		expect(response.body).toMatchObject({ error: 'An unexpected error occurred while updating constituency' });
	});
});

describe('DELETE /api/v1/constituency/:id', () => {
	it('should return 200 OK when deleting a constituency', async () => {
		const constituency = await Constituency.findOne();
		const response = await request(app).delete(`${baseRoute}/${constituency._id.toString()}`);
		expect(response.body).toMatchObject({
			message: 'Constituency deleted successfully',
			constituency: {
				_id: constituency._id.toString(),
				name: constituency.name,
			},
		});
		expect(response.status).toBe(200);
	});

	it('should return 204 No Content when no constituency is found', async () => {
		const constituency = new mongoose.Types.ObjectId();
		const response = await request(app).delete(`${baseRoute}/${constituency._id.toString()}`);
		expect(response.status).toBe(204);
	});

	it('should return 400 Bad Request when deleting a constituency with an invalid ID', async () => {
		const response = await request(app).delete(`${baseRoute}/invalid`);
		expect(response.status).toBe(400);
	});

	it('should return 500 Internal Server Error when an unexpected error occurs', async () => {
		mockError('findByIdAndDelete');
		const response = await request(app).delete(`${baseRoute}/${new mongoose.Types.ObjectId()}`);
		expect(response.status).toBe(500);
		expect(response.body).toMatchObject({ error: 'An unexpected error occurred while deleting constituency' });
	});
});

afterAll(async () => {
	server.close();
	await mongoose.connection.close();
});