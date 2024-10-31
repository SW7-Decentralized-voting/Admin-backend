import handleQuery from '../utils/handleQuery.js';
import validationError, { checkIdsAndGiveErrors } from '../utils/validationError.js';
import { validateSingleObjectId } from '../utils/validationError.js';
import NominationDistrict from '../schemas/NominationDistrict.js';

/**
 * Fetch nomination districts from the database
 * @param {Request} req Express request object possibly containing query parameters (e.g. name, constituency)
 * @param {Response} res Express response object to send the response
 * @returns {Response} A list of nomination districts or an error message
 */
async function fetchNominationDistricts(req, res) {
	try {
		const query = handleQuery(req.query, NominationDistrict);
		const nominationDistricts = await NominationDistrict.find(query);
		return res.status(200).json(nominationDistricts);
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
		console.error(`Error fetching nomination districts: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while fetching nomination districts',
		});
	}
}

/**
 * Create a new nomination district and save it to the database
 * @param {Request} req Express request object containing the nomination district object in the body
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message with the new nomination district (if successful)
 */
async function addNominationDistrict(req, res) {
	const nominationDistrict = req.body;
	const newNominationDistrict = new NominationDistrict(nominationDistrict);

	try {
		await newNominationDistrict.save();
		return res.status(201).json({
			message: 'Nomination district added successfully',
			nominationDistrict: newNominationDistrict,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				errors: validationError(error),
			});
		}
		// eslint-disable-next-line no-console
		console.error(`Error adding nomination district: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while adding nomination district',
		});
	}
}

/**
 * Update a nomination district in the database
 * @param {Request} req Express request object containing the nomination district object in the body and the nomination district ID in the params
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message with the updated nomination district (if successful)
 */
async function updateNominationDistrict(req, res) {
	const id = req.params.id;
	const { constituency } = req.body;

	if (!validateSingleObjectId(id)) {
		return res.status(400).json({
			error: 'Invalid ID: ' + id,
		});
	}
	
	const idErrs = checkIdsAndGiveErrors([{ name: 'constituency', id: constituency }]);
	if (Object.keys(idErrs).length > 0) {
    return res.status(400).json({
      errors: idErrs,
    });
  }

	const nominationDistrict = req.body;
	try {
		const updatedNominationDistrict = await NominationDistrict.findByIdAndUpdate(id, nominationDistrict, { new: true, runValidators: true });
		if (!updatedNominationDistrict) {
			return res.status(404).json({
				error: 'Nomination district not found',
			});
		}
		return res.status(200).json({
			message: 'Nomination district updated successfully',
			nominationDistrict: updatedNominationDistrict,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				errors: validationError(error),
			});
		}
		// eslint-disable-next-line no-console
		console.error(`Error updating nomination district: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while updating nomination district',
		});
	}
}

/**
 * Delete a nomination district from the database
 * @param {Request} req Express request object containing the nomination district ID in the params
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message with the deleted nomination district (if found)
 */
async function deleteNominationDistrict(req, res) {
	const id = req.params.id;
	if (!validateSingleObjectId(id)) {
		return res.status(400).json({
			error: 'Invalid ID: ' + id,
		});
	}

	try {
		const deletedNominationDistrict = await NominationDistrict.findByIdAndDelete(id);
		if (!deletedNominationDistrict) {
			return res.status(204).send();
		}
		return res.status(200).json({
			message: 'Nomination district deleted successfully',
			nominationDistrict: deletedNominationDistrict,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Error deleting nomination district: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while deleting nomination district',
		});
	}
}

export { fetchNominationDistricts, addNominationDistrict, updateNominationDistrict, deleteNominationDistrict };

/**
 * @import { Request, Response } from 'express';
 */