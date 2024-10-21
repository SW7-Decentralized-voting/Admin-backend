/**
 * Formats a mongoose validation error into a more readable format
 * @param {ValidationError} error The validation error object from mongoose
 * @returns {{[key: string]: string}} A list of errors with the field name as the key and the error message as the value
 */
export default function validationError(error) {
	let errorList = {};
	for (const err in error.errors) {
		const errorObj = error.errors[err];
		errorList[err] = `'${errorObj.value}' (type ${errorObj.valueType}) is not a valid ${errorObj.kind}`;
	}

	return errorList;
}

/**
 * @typedef {import('mongoose').Error.ValidationError} ValidationError
 */
