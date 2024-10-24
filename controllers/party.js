import Party from '../schemas/Party.js';
import validationError from '../utils/validationError.js';

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

export { addParty, updateParty };

/**
 * @import { Request, Response } from 'express';
 */