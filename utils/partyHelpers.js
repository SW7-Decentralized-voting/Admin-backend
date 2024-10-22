import Party from '../schemas/Party.js';

/**
 * Get all parties from the database
 * @returns {Promise<Array<Party>>} List of all parties
 */
async function getAllParties() {
	const parties = await Party.find();
	return parties;
}

export { getAllParties };

/**
 * @typedef {object} PartyObj
 * @property {string} name Name of the party
 * @property {string} list The party list (e.g. 'A', 'B', 'C')
 */