import dotenv from 'dotenv';
import axios from 'axios';
import { Express } from 'express';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/candidate';

/**
 * Add a candidate to the blockchain
 * @param {Express.Request} req Token header and numKeys in body
 * @param {Express.Response} res HTTP response
 * @returns {Express.Response} Success or error message
 */
async function addCandidate(req, res) {
  try {
    const response = await axios.post(`${url}/add`, req.body);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export { addCandidate };