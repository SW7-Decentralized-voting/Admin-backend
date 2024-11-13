// Tests for /utils/handleQuery.js

import handleQuery from '../../utils/handleQuery.js';

describe('handleQuery', () => {
	it('should return an object with a filter key', () => {
		const query = { name: 'test' };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result).toHaveProperty('name');
	});

	it('should throw an error if the query parameter is invalid', () => {
		const query = { invalid: 'test' };
		const model = { schema: { paths: { name: {} } } };

		expect(() => handleQuery(query, model)).toThrow(
			'Invalid query parameter: invalid'
		);
	});

	it('should return an object with a populate key if defined in query', () => {
		const query = { populate: 'name' };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result).toHaveProperty('populate');
	});

	it('should split comma separated values for strings', () => {
		const query = { name: 'test1,test2' };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result.name).toEqual(['test1', 'test2']);
	});

	it('should split comma separated values for strings (one value/no comma)', () => {
		const query = { name: 'test' };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result.name).toEqual(['test']);
	});

	it('should sanitize string values', () => {
		const query = { name: 'test^(!=?' };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result.name).toEqual(['test']);
	});

	it('should sanitize string values (multiple values)', () => {
		const query = { name: 'test1^(!=?,test2^(!=?' };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result.name).toEqual(['test1', 'test2']);
	});

	it('should take both numbers, strings, booleans, null values, and arrays', () => {
		const query = { name: 'test1,test2', number: 123, arrayNum: [1, 2, 3], arrayStr: ['test1', 'test2'], bool: true, null: null };
		const model = { schema: { paths: { name: {}, number: {}, arrayNum: {}, arrayStr: {}, bool: {}, null: {} } } };
		const result = handleQuery(query, model);

		expect(result).toEqual({
			name: ['test1', 'test2'],
			number: 123,
			arrayNum: [1, 2, 3],
			arrayStr: ['test1', 'test2'],
			bool: true,
			null: null
		});
	});

	it('should just keep undefined values (mongoose will ignore them)', () => {
		const query = { name: undefined };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result).toEqual({ name: undefined });
	});

	it('should handle empty strings', () => {
		const query = { name: '' };
		const model = { schema: { paths: { name: {} } } };
		const result = handleQuery(query, model);

		expect(result).toEqual({ name: [''] });
	});


});