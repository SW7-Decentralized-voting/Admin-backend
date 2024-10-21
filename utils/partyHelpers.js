import Party from '../schemas/Party.js'

// Function to add a party to the database
async function addParty(party) {
	const newParty = new Party(party);
	await newParty.save();
	return {
		message: 'Party added successfully',
		party: newParty,
	};
}

// Function to get all parties from the database
async function getAllParties() {
	const parties = await Party.find();
	return parties;
}

export { addParty, getAllParties };