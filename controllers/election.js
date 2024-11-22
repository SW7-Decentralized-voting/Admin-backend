import * as e from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { getAllCandidates } from '../utils/candidateHelpers.js';
import { getAllParties } from '../utils/partyHelpers.js';
import express from 'express';
import { auth } from '../middleware/verifyToken.js';

const app = express();

// Middleware for parsing JSON
app.use(express.json());

dotenv.config();
const url = process.env.BLOCKCHAIN_URL + '/election';

/**
 * Start an election on the blockchain
 * @param {e.Request} req HTTP request object
 * @param {e.Response} res HTTP response object
 * @returns {e.Response} Success or error message
 */
async function startElection(req, res) {  
  let candidates, parties;
  const { voterCount } = req.body;

  try {
    // Fetch data
    candidates = await getAllCandidates();
    parties = await getAllParties();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  // Retrieve the token from the request (assumes the token is included in req.headers.Authorization)
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is missing' });
  }

  // Include the token in the Axios request headers
  try {
    const response = await axios.post(
      `${url}/start`,
      {
        candidates: candidates,
        parties: parties,
        voterCount: voterCount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Attach the token
        },
      }
    );

    // Use the response data if necessary
    console.log('Election has successfully started!');
    console.log('Election Details:', {
      candidates: candidates.length,
      parties: parties.length,
      voterCount,
    });

    // Return blockchain response data as well (optional)
    return res.status(200).json({
      message: 'Election has successfully started!',
      phase: 'REGISTRATION',
      blockchainResponse: response.data, // Send blockchain data if necessary
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(500).json({ error: 'Blockchain service cannot be reached' });
    }

    // Pass on the specific error status and data
    return res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
}



/**
 * Updates the election phase on the blockchain 
 * @param {e.Request} req HTTP request object, expected to contain the `phase` in the body
 * @param {e.Response} res HTTP response object
 * @returns {e.Response} Success or error message
 */ 
async function updateElectionPhase(req, res) {
  //eslint-disable-next-line no-console
  console.log('Request body received by backend:', req.body); // Debugging request body

  const { phase } = req.body;

  const validPhases = ['NOT_STARTED', 'REGISTRATION', 'VOTING', 'TALLYING', 'COMPLETED'];
  if (!validPhases.includes(phase)) {
      return res.status(400).json({ error: `Invalid phase. Valid phases are: ${validPhases.join(', ')}` });
  }

  try {
      const response = await axios.post(`${url}/updatePhase`, { phase });
      return res.status(200).json(response.data);
  } catch (error) {
    //eslint-disable-next-line no-console
    console.error('Error updating election phase:', error);
    if (error.response && error.response.status === 404) {
        return res.status(500).json({ error: 'Blockchain service cannot be reached' });
    }
    return res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
}

// Ensure the route handler is set up properly to pass `req` and `res` to the function
app.post('/api/v1/election/start', auth, async (req, res) => {
  try {
    await startElection(req, res);  // Pass the `req` and `res` to the function
  } catch (error) {
    //eslint-disable-next-line no-console
    console.error('Error in /election/start route:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/election/updatePhase', auth, async (req, res) => {
  try {
    await updateElectionPhase(req, res);  // Pass `req` and `res` here as well
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in /election/updatePhase route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Don't forget to export the router
export { startElection, updateElectionPhase };
