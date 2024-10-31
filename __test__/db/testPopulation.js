import Party from '../../schemas/Party.js';
import Constituency from '../../schemas/Constituency.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Candidate from '../../schemas/Candidate.js';
import PollingStation from '../../schemas/PollingStation.js';
import mockData from './mockData';
import { districtsWithIds, candidateWithIds, pollingStationWithIds } from './addIds';

/**
 * Populate the database with mock data
 */
export default async function populateDb() {
	await Party.deleteMany({});
	await Constituency.deleteMany({});
	await NominationDistrict.deleteMany({});
	await Candidate.deleteMany({});
	await PollingStation.deleteMany({});
	await Party.insertMany(mockData.parties);
	await Constituency.insertMany(mockData.constituencies);
	await NominationDistrict.insertMany(await districtsWithIds(mockData.nominationDistricts));
	await Candidate.insertMany(await candidateWithIds(mockData.candidates));
	await PollingStation.insertMany(await pollingStationWithIds(mockData.pollingStations));

	return;
}