import Key from '../schemas/Key.js';
import PollingStation from '../schemas/PollingStation.js';
import { v4 as uuidv4 } from 'uuid';
import Queue from 'bull';

const baseUrl = 'http://localhost:';
const port = process.env.PORT || 8888;

export async function generateKeys(req, res) {
	const queueId = uuidv4();
	let pollingStationIds = req.body.pollingStations;

	const keyQueue = new Queue('key-generation-' + queueId);

	if (!pollingStationIds) {
		pollingStationIds = (await PollingStation.find({})).map(station => station._id.toString());
	}

	const pollingStations = await PollingStation.find({ _id: { $in: pollingStationIds } });
	const validStationIds = pollingStations.map(station => station._id.toString());
	const invalidStations = pollingStationIds.filter((id) => !validStationIds.includes(id));
	if (invalidStations.length > 0) {
		return res.status(400).json({
			status: 'error',
			error: 'Invalid polling station IDs: ' + invalidStations.join(', '),
		});
	}

	console.log(keyQueue.name)

	pollingStations.forEach((station) => {
		keyQueue.add({
			pollingStationId: station._id,
			expectedVoters: station.expectedVoters,
		});
	});


	keyQueue.process(async (job) => {
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
	});

	return res.status(202).json({
		message: 'Key generation started',
		statusLink: baseUrl + port + '/api/v1/keys/status/' + queueId,
	});
}