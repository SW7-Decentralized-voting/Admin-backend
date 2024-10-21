import Candidate from '../schemas/Candidate.js'

// Function to add a candidate to the database
async function addCandidate(candidate) {
	const newCandidate = new Candidate(candidate);
	await newCandidate.save();
	return {
		message: 'Candidate added successfully',
		candidate: newCandidate,
	};
}

// Function to get all candidates from the database
async function getAllCandidates() {
	const candidates = await Candidate.find();
	return candidates;
}

export { addCandidate, getAllCandidates };