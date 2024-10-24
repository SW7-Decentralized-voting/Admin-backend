// Make tests for the validationError function in utils/validationError.js

import validationError, { checkIdsAndGiveErrors } from '../../utils/validationError.js';

describe('validationError', () => {
	it('should return an object with relevant errors based on mongoose error (1)', () => {
		const error = {
			errors: {
				name: {
					message: 'Name is required',
					name: 'ValidatorError',
					properties: {
						message: 'Name is required',
						type: 'required',
					},
					kind: 'required',
				},
			}
		};
		const result = validationError(error);
		expect(result).toEqual({ name: 'name is required' });

	});

	it('should return an object with relevant errors based on mongoose error (2)', () => {
		const error = {
			errors: {
				name: {
					message: 'Name must be longer than 2 characters',
					name: 'ValidatorError',
					properties: {
						message: 'Name must be longer than 2 characters',
						type: 'user defined',
					},
					kind: 'user defined',
				},
				list: {
					message: 'List must be a one letter (uppercase) string',
					name: 'ValidatorError',
					properties: {
						message: 'List must be a one letter (uppercase) string',
						type: 'user defined',
					},
					kind: 'user defined',
				}
			}
		};
		const result = validationError(error);
		expect(result).toEqual({
			name: 'Name must be longer than 2 characters',
			list: 'List must be a one letter (uppercase) string',
		});
	});

	it('should return an object with relevant errors based on mongoose error (3)', () => {
		const error = {
			errors: {
				name: {
					message: 'Name is required',
					name: 'ValidatorError',
					properties: {
						message: 'Name is required',
						type: 'required',
					},
					kind: 'required',
				},
				party: {
					value: 5,
					valueType: 'number',
					kind: 'ObjectId',
				},
			}
		};
		const result = validationError(error);
		expect(result).toEqual({
			name: 'name is required',
			party: '\'5\' (type number) is not a valid ObjectId',
		});
	});
});

describe('checkIdsAndGiveErrors', () => {
	it('should return an object with relevant errors based on ObjectIds validity', () => {
		const idList = [
			{ id: '5', name: 'party' },
			{ id: 'invalid', name: 'nominationDistrict' },
		];
		const result = checkIdsAndGiveErrors(idList);
		expect(result).toEqual({
			party: '\'5\' (type string) is not a valid ObjectId',
			nominationDistrict: '\'invalid\' (type string) is not a valid ObjectId',
		});
	});

	it('should return an object with relevant errors based on ObjectIds validity (2)', () => {
		const idList = [
			{ id: null, name: 'party' },
			{ id: 'invalid', name: 'nominationDistrict' },
		];
		const result = checkIdsAndGiveErrors(idList);
		expect(result).toEqual({
			party: '\'null\' (type object) is not a valid ObjectId',
			nominationDistrict: '\'invalid\' (type string) is not a valid ObjectId',
		});
	});

	it('should return an object with relevant errors based on ObjectIds validity (3)', () => {
		const idList = [
			{ id: '507fbc292b83c83cf284de21', name: 'party' },
			{ id: 392154, name: 'nominationDistrict' },
		];
		const result = checkIdsAndGiveErrors(idList);
		expect(result).toEqual({
			nominationDistrict: '\'392154\' (type number) is not a valid ObjectId',
		});
	});

	it('should return an empty object if no ObjectIds are provided', () => {
		const idList = [
			{ name: 'party' },
			{ name: 'nominationDistrict' },
		];
		const result = checkIdsAndGiveErrors(idList);
		expect(result).toEqual({});
	});

	it('should return an empty object if all ObjectIds are valid', () => {
		const idList = [
			{ id: '507fbc292b83c83cf284de21', name: 'party' },
			{ id: '507f1f77bcf86cd799439011', name: 'nominationDistrict' },
		];
		const result = checkIdsAndGiveErrors(idList);
		expect(result).toEqual({});
	});
});