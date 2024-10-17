import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/election';

/**
 * @param {Express.Request} req Token header and numKeys in body
 * @param {Express.Response} res HTTP response
 * @returns 
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

/** TODO: add tree to mongodb
async function addTreeToDatabase(tree) {
 
}
**/
export { startElection };