import Candidate from '../schemas/Candidate.js';

/**
 * Add a candidate to the database
 * @param {CandidateObj} candidate Candidate object to be added to the database (name, party, nominationDistrict)
 * @returns {Promise<{message: string, candidate: Candidate}>} Message and candidate object
 */
async function addCandidate(candidate) {
	const newCandidate = new Candidate(candidate);
	await newCandidate.save();
	return {
		message: 'Candidate added successfully',
		candidate: newCandidate,
	};
}

/**
 * Get all candidates from the database
 * @returns {Promise<Array<Candidate>>} List of all candidates
 */
async function getAllCandidates() {
	const candidates = await Candidate.find();
	return candidates;
}

export { addCandidate, getAllCandidates };

/**
 * @typedef {object} CandidateObj
 * @property {string} name Name of the candidate
 * @property {string} party ID of the party the candidate belongs to
 * @property {string} nominationDistrict ID of the district the candidate is nominated in
 */