import Constituency from '../schemas/Constituency.js';
import handleQuery from '../utils/handleQuery.js';
import validationError, { validateSingleObjectId } from '../utils/validationError.js';


/**
 * Fetch nomination districts from the database
 * @param {Request} req Express request object with query parameters
 * @param {Response} res Express response object
 * @returns {Response} Response object with the constituencies
 */
async function fetchConstituencies(req, res) {
	try {
		const query = handleQuery(req.query, Constituency);
		const constituencies = await Constituency.find(query);
		return res.status(200).json( constituencies );
	} catch (error) {
		if (error.message.includes('Invalid query parameter')) {
			return res.status(400).json({
				error: error.message,
			});
		}

		if (error.name === 'CastError') {
			return res.status(400).json({
				error: 'Invalid ID: ' + error.value,
			});
		}

		// eslint-disable-next-line no-console
		console.error(`Error fetching constituencies: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while fetching constituencies',
		});
	}
}

/**
 * Add a new constituency to the database
 * @param {Request} req Express request object with constituency details
 * @param {Response} res Express response object
 * @returns {Response} Response object with the added constituency
 */
async function addConstituency(req, res) {
	const constituency = req.body;
	const newConstituency = new Constituency(constituency);

	try {
		await newConstituency.save();
		return res.status(201).json({
			message: 'Constituency added successfully',
			constituency: newConstituency,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				errors: validationError(error),
			});
		}
		// eslint-disable-next-line no-console
		console.error(`Error adding constituency: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while adding constituency',
		});
	}
}

/**
 * Update a constituency in the database
 * @param {Request} req Express request object with constituency ID and details
 * @param {Response} res Express response object
 * @returns {Response} Response object with the updated constituency
 */
async function updateConstituency(req, res) {
	const { id } = req.params;
	const constituency = req.body;

	if (!validateSingleObjectId(id)) {
		return res.status(400).json({
			error: 'Invalid ID: ' + id,
		});
	}

	try {
		const updatedConstituency = await Constituency.findByIdAndUpdate(id, constituency, { new: true, runValidators: true });
		if (!updatedConstituency) {
			return res.status(404).json({
				error: 'Constituency not found',
			});
		}

		return res.status(200).json({
			message: 'Constituency updated successfully',
			constituency: updatedConstituency,
		});

	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				errors: validationError(error),
			});
		}

		// eslint-disable-next-line no-console
		console.error(`Error updating constituency: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while updating constituency',
		});
	}
}

/**
 * Delete a constituency from the database
 * @param {Request} req Express request object with constituency ID
 * @param {Response} res Express response object
 * @returns {Response} Response object with the deleted constituency
 */
async function deleteConstituency(req, res) {
	const { id } = req.params;

	if (!validateSingleObjectId(id)) {
		return res.status(400).json({
			error: 'Invalid ID: ' + id
		});
	}

	try {
		const deletedConstituency = await Constituency.findByIdAndDelete(id);

		if (!deletedConstituency) {
			return res.status(204).send();
		}

		return res.status(200).json({
			message: 'Constituency deleted successfully',
			constituency: deletedConstituency,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Error deleting constituency: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while deleting constituency',
		});
	}
}

export { fetchConstituencies, addConstituency, updateConstituency, deleteConstituency };

/**
 * @import { Request, Response } from 'express';
 */