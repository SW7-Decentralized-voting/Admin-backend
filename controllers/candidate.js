import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/candidate';

/**
 * @param {Express.Request} req Token header and numKeys in body
 * @param {Express.Response} res HTTP response
 * @returns 
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