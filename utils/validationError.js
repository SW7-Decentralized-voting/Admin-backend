import mongoose from 'mongoose';

/**
 * Formats a mongoose validation error into a more readable format
 * @param {ValidationError} error The validation error object from mongoose
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

function checkIdsAndGiveErrors(idList) {
	let errorList = {};
	for (const obj of idList) {
		if (obj.id === undefined) {
			continue;
		}
		if (!mongoose.Types.ObjectId.isValid(obj.id)) {
			errorList[obj.name] = `'${obj.id}' (type ${typeof obj.id}) is not a valid ObjectId`;
		};
	}

	return errorList;
}

export { checkIdsAndGiveErrors };

/**
 * @typedef {import('mongoose').Error.ValidationError} ValidationError
 */
