import Party from '../schemas/Party.js';

/**
 * Add a party to the database
 * @param {PartyObj} party Party object to be added to the database (name, list)
 * @returns {Promise<{message: string, party: Party}>} Message and party object
 */
async function addParty(party) {
	const newParty = new Party(party);
	await newParty.save();
	return {
		message: 'Party added successfully',
		party: newParty,
	};
}

/**
 * Get all parties from the database
 * @returns {Promise<Array<Party>>} List of all parties
 */
async function getAllParties() {
	const parties = await Party.find();
	return parties;
}

export { addParty, getAllParties };

/**
 * @typedef {object} PartyObj
 * @property {string} name Name of the party
 * @property {string} list The party list (e.g. 'A', 'B', 'C')
 */