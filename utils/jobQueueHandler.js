import { v4 as uuidv4 } from 'uuid';
import PollingStation from '../schemas/PollingStation.js';
import Key from '../schemas/Key.js';

/**
 * Create keys for a polling station
 * @param {JobObj} job Job object with polling station ID and expected voters
 */
export default async function jobHandler(job) {
	const { pollingStationId, expectedVoters } = job.data;

	const station = await PollingStation.findById(pollingStationId);
	if (!station) {
		throw new Error('Polling station not found: ' + pollingStationId);
	}

	const keys = [];
	for (let i = 0; i < expectedVoters; i++) {
		const key = Key({
			pollingStation: station._id,
			keyHash: uuidv4(),
		});
		keys.push(key);
	}

	await Key.insertMany(keys);
}

/**
 * @typedef {object} JobObj
 * @property {object} data Job data
 * @property {string} data.pollingStationId ID of the polling station to generate keys for
 * @property {number} data.expectedVoters Number of expected voters at the polling station
 */