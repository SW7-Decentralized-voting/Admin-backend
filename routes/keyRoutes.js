import express from 'express';
import { auth } from '../middleware/verifyToken.js';
import { generateKeys } from '../controllers/keys.js';
import PollingStation from '../schemas/PollingStation.js';

// Queue status
import Queue from 'bull';

const router = express.Router();

/**
 * @swagger
 * /keys/generate:
 *  post:
 *  tags: [Keys]
 *  summary: Generate keys for polling stations
 * 	description: Generate keys for polling stations
 *  security: [Authorization: []]
 *  requestBody:
 *   $ref: '#/components/reqBody/generateKeys'
 *  responses:
 *   201:
 *    $ref: '#/components/responses/key/201'
 *   400:
 *    $ref: '#/components/responses/key/400/post'
 *   401:
 *    $ref: '#/components/responses/general/401'
 */
router.post('/generate', auth, (req, res) => {
	generateKeys(req, res);
});

router.get('/status/:queueId', async (req, res) => {
	const { queueId } = req.params;

	const keyQueue = new Queue('key-generation-' + queueId);

	console.log('Queue id:', keyQueue.name);

	const jobCounts = await keyQueue.getJobCounts();
	const total = jobCounts.waiting + jobCounts.active + jobCounts.completed + jobCounts.failed;

	return res.status(200).json({
		total: total,
		waiting: jobCounts.waiting,
		active: jobCounts.active,
		completed: jobCounts.completed,
		failed: jobCounts.failed,
		process: (jobCounts.completed / total * 100).toFixed(2),
	});
});

export default router;