import Party from '../schemas/Party.js';
import validationError from '../utils/validationError.js';
import { validateSingleObjectId } from '../utils/validationError.js';

/**
 * Add a party to the database
 * @param {Request} req Request object containing the party object in the body
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message
 */
async function addParty(req, res) {
	const party = req.body;
	const newParty = new Party(party);

	try {
		await newParty.save();
		return res.status(201).json({
			message: 'Party added successfully',
			party: newParty,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				errors: validationError(error),
			});
		}
		// eslint-disable-next-line no-console
		console.error(`Error adding party: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while adding the party',
		});
	}
}

/**
 * Update a party in the database
 * @param {Request} req Request object containing the party object in the body and the party ID in the params
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message
 */
async function updateParty(req, res) {
	const partyId = req.params.id;
	const updatedPartyData = req.body;

	// Validate the request
	const validationErrorResponse = validateUpdateRequest(partyId, updatedPartyData);
	if (validationErrorResponse) {
			return res.status(400).json(validationErrorResponse);
	}

	try {
			// Find the party by ID and update it
			const updatedParty = await Party.findByIdAndUpdate(partyId, updatedPartyData, { new: true, runValidators: true });

			if (!updatedParty) {
					return res.status(404).json({
							error: 'Party not found',
					});
			}

			return res.status(200).json({
					message: 'Party updated successfully',
					party: updatedParty,
			});
	} catch (error) {
			if (error.name === 'ValidationError') {
					return res.status(400).json({
							errors: validationError(error),
					});
			}
			// eslint-disable-next-line no-console
			console.error(`Error updating party: ${error.message}`);
			return res.status(500).json({
					error: 'An unexpected error occurred while updating the party',
			});
	}
}

/**
 * Delete a party from the database
 * @param {Request} req Request object containing the party ID in the params
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message
 */
async function deleteParty(req, res) {
	const partyId = req.params.id;

	// Validate the partyId
	if (!validateSingleObjectId(partyId)) {
			return res.status(400).json({
					error: 'Invalid party ID format',
			});
	}

	try {
			// Find the party by ID and remove it
			const deletedParty = await Party.findByIdAndDelete(partyId);

			if (!deletedParty) {
					return res.status(204).json();
			}

			return res.status(200).json({
					message: 'Party deleted successfully',
					party: deletedParty,
			});
	} catch (error) {
			// eslint-disable-next-line no-console
			console.error(`Error deleting party: ${error.message}`);
			return res.status(500).json({
					error: 'An unexpected error occurred while deleting the party',
			});
	}
}

/**
 * Validate the request for a party with an id in the params
 * @param {string} partyId The ID of the party
 * @param {object} updatedPartyData The update data
 * @returns {object|null} Error object if validation fails, or null if valid
 */
function validateUpdateRequest(partyId, updatedPartyData) {
	const allowedFields = ['name', 'list'];

	// Validate the partyId
	if (!validateSingleObjectId(partyId)) {
			return { error: 'Invalid party ID format' };
	}

	// Validate that either "name" or "list" is provided in the body
	if (!updatedPartyData.name && !updatedPartyData.list) {
			return { error: 'Please provide a name or list to update' };
	}

	// Check for extra fields in the request body
	const invalidFields = Object.keys(updatedPartyData).filter(
			(key) => !allowedFields.includes(key)
	);

	if (invalidFields.length > 0) {
			return { error: `Invalid fields in the request body: ${invalidFields.join(', ')}` };
	}

	// Return null if no validation errors
	return null;
}

export { addParty, updateParty, deleteParty };

/**
 * @import { Request, Response } from 'express';
 */