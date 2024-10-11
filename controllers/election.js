import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/election';

export async function startElection(req, res) {
  try {
    const response = await axios.post(`${url}/start`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}