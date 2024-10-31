import Candidate from '../schemas/Candidate.js';

/**
 * Get all candidates from the database
 * @returns {Promise<Array<Candidate>>} List of all candidates
 */
async function getAllCandidates() {
	const candidates = await Candidate.find();
	return candidates;
}

export { getAllCandidates };