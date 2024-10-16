import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from 'redis';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/election';

const redisClient = createClient({
  url: 'redis://localhost:6379' // Local Redis server
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.connect();

/**
 * @param {Express.Request} req Token header and numKeys in body
 * @param {Express.Response} res HTTP response
 * @returns 
 */
async function startElection(req, res) {
  try {
    const response = await axios.post(`${url}/start`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function transmitKeyGenerationSignal(req, res) {
  try {
      const { numKeys } = req.body;
      await redisClient.publish('keyGeneration', JSON.stringify({ numKeys }));
      return res.status(200).json({ message: 'Key generation signal transmitted' });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
}

export { startElection, transmitKeyGenerationSignal };