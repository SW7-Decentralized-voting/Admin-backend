import PollingStation from '../schemas/PollingStation.js';
import handleQuery from '../utils/handleQuery.js';
import validationError, { checkIdsAndGiveErrors } from '../utils/validationError.js';
import { validateSingleObjectId } from '../utils/validationError.js';

/**
 * Fetch polling stations from the database
 * @param {Request} req Express request object possibly containing query parameters (e.g. name, _id)
 * @param {Response} res Express response object to send the response
 * @returns {Response} A list of polling stations or an error message
 */
async function fetchPollingStations(req, res) {

	try {
		const query = handleQuery(req.query, PollingStation);
		const pollingStations = await PollingStation.find({...query, populate: null}).populate(query.populate);
		
		return res.status(200).json(pollingStations);
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
		console.error(`Error fetching polling stations: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while fetching polling stations',
		});
	}
}

/**
 * Add a polling station to the database
 * @param {Request} req Request object containing the polling station object in the body
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message with the added polling station (if valid)
 */
async function addPollingStation(req, res) {
	const pollingStation = req.body;
	const newPollingStation = new PollingStation(pollingStation);

	try {
		await newPollingStation.save();
		return res.status(201).json({
			message: 'Polling station added successfully',
			pollingStation: newPollingStation,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				errors: validationError(error),
			});
		}
		// eslint-disable-next-line no-console
		console.error(`Error adding polling station: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while adding polling station',
		});
	}
}

/**
 * Update a polling station in the database
 * @param {Request} req Request object containing the polling station object in the body and the polling station ID in the params
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message with the updated polling station (if valid)
 */
async function updatePollingStation(req, res) {
	const { id }= req.params;
	const pollingStation = req.body;

	if (!validateSingleObjectId(id)) {
		return res.status(400).json({
			error: 'Invalid ID: ' + id,
		});
	}

	const idErrs = checkIdsAndGiveErrors([{ name: 'nominationDistrict', id: pollingStation.nominationDistrict }]);

	if (Object.keys(idErrs).length > 0) {
		return res.status(400).json({
			errors: idErrs,
		});
	}

	try {
		const updatedPollingStation = await PollingStation.findByIdAndUpdate(id, pollingStation, { new: true, runValidators: true });
		if (!updatedPollingStation) {
			return res.status(404).json({
				error: 'Polling station not found',
			});
		}
		return res.status(200).json({
			message: 'Polling station updated successfully',
			pollingStation: updatedPollingStation,
		});
	} catch (error) {
		if (error.name === 'ValidationError') {
			return res.status(400).json({
				errors: validationError(error),
			});
		}
		// eslint-disable-next-line no-console
		console.error(`Error updating polling station: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while updating polling station',
		});
	}
}

/**
 * Delete a polling station from the database
 * @param {Request} req Request object containing the polling station ID in the params
 * @param {Response} res Express response object to send the response
 * @returns {Response} Success or error message with the deleted polling station (if found)
 */
async function deletePollingStation(req, res) {
	const id = req.params.id;
	if (!validateSingleObjectId(id)) {
		return res.status(400).json({
			error: 'Invalid ID: ' + id,
		});
	}

	try {
		const deletedPollingStation = await PollingStation.findByIdAndDelete(id);
		if (!deletedPollingStation) {
			return res.status(204).send();
		}
		return res.status(200).json({
			message: 'Polling station deleted successfully',
			pollingStation: deletedPollingStation,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Error deleting polling station: ${error.message}`);
		return res.status(500).json({
			error: 'An unexpected error occurred while deleting polling station',
		});
	}
}

export { fetchPollingStations, addPollingStation, updatePollingStation, deletePollingStation };