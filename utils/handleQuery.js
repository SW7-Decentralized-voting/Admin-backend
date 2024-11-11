// Sanitize query string and return an object for Sequelize query

import { Schema } from 'mongoose';

/**
 * Sanitize query string and return an object for mongoose query
 * @param {object} query user query object to sanitize and check for valid query parameters
 * @param {Schema} model mongoose schema to check for valid query
 * @returns {object} sanitized query object with valid query parameters
 */
const handleQuery = (query, model) => {
	let queryObj = {};

	for (const key in query) {
		if (model.schema.paths[key]) {
			if (typeof query[key] === 'string') {
				queryObj[key] = sanitize(query[key].split(','));
			} else {
				queryObj[key] = sanitize(query[key]);
			}
		} else if (key === 'populate' && query[key]) {
			console.log(query.populate);
			queryObj.populate = query.populate.split(',').filter(field => model.schema.paths[field]);
		} else {
			throw Error(`Invalid query parameter: ${key}`);
		}
	}

	return queryObj;
};

/**
 * Sanitize input to remove special characters and return only alphanumeric characters and spaces
 * @param {*} input unsanitized input
 * @returns {*} sanitized input
 */
const sanitize = (input) => {
	if (Array.isArray(input) && typeof input[0] === 'string')
		return input.map(str => str.replace(/[^a-zA-Z0-9 ]/g, ''));

	return input;
};

export default handleQuery;