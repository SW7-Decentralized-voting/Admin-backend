import mongoose from 'mongoose';

/**
 * Formats a mongoose validation error into a more readable format
 * @param {Error.ValidationError} error The validation error object from mongoose
 * @returns {{[key: string]: string}} A list of errors with the field name as the key and the error message as the value
 */
export default function validationError(error) {
	let errorList = {};
	for (const err in error.errors) {
		const errorObj = error.errors[err];
		if (errorObj.kind === 'required') {
			errorList[err] = `${err} is required`;
			continue;
		}

		if (errorObj.kind === 'user defined') {
			errorList[err] = errorObj.message;
			continue;
		}
		errorList[err] = `'${errorObj.value}' (type ${errorObj.valueType}) is not a valid ${errorObj.kind}`;
	}

	return errorList;
}

/**
 * Validates a single ObjectId
 * @param {string} id - The MongoDB ObjectId to validate
 * @returns {boolean} - Returns true if the ObjectId is valid, otherwise false
 */
function validateSingleObjectId(id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return false;
	}

	if (new mongoose.Types.ObjectId(id).toString() !== id) {
		return false;
	}
	return true;
}

/**
 * Validates a list of ObjectIds and returns a list of errors if any invalid
 * @param {Array<{id: string, name: string}>} idList - List of objects containing ObjectId and field names
 * @returns {{[key: string]: string}} - A list of errors with the field name as the key and the error message as the value
 */
function checkIdsAndGiveErrors(idList) {
	let errorList = {};
	for (const obj of idList) {
		if (obj.id === undefined) {
			continue;
		}
		if (!validateSingleObjectId(obj.id)) {
			errorList[obj.name] = `'${obj.id}' (type ${typeof obj.id}) is not a valid ObjectId`;
		}
	}

	return errorList;
}

export { validateSingleObjectId, checkIdsAndGiveErrors };

/**
 * @import { Error } from 'mongoose'
 */