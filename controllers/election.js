import dotenv from 'dotenv';
import axios from 'axios';
import * as e from 'express';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/election';

/**
 * Start an election on the blockchain
 * @param {e.Response} res HTTP response object
 * @returns {e.Response} Success or error message
 */
function startElection(res) {
  return axios.post(`${url}/start`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      if (error.response.status === 404) {
        return res.status(500).json({ error: 'Blockchain service cannot be reached' });
      }
      return res.status(error.response.status).json(error.response.data);
    });
}

/* TODO: add tree to mongodb
async function addTreeToDatabase(tree) {
 
}
*/
export { startElection };
