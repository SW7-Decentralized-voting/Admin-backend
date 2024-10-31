import Party from '../../schemas/Party.js';
import Constituency from '../../schemas/Constituency.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Candidate from '../../schemas/Candidate.js';
import mockData from './mockData';
import { districtsWithIds, candidateWithIds } from './addIds';

/**
 * Populate the database with mock data
 */
export default async function populateDb() {
	await Party.insertMany(mockData.parties);
	await Constituency.insertMany(mockData.constituencies);
	await NominationDistrict.insertMany(await districtsWithIds(mockData.nominationDistricts));
	await Candidate.insertMany(await candidateWithIds(mockData.candidates));

	return;
}