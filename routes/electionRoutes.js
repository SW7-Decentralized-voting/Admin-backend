import express from 'express';
import { startElection, updateElectionPhase } from '../controllers/election.js';
import { auth } from '../middleware/verifyToken.js'; 

const router = express.Router();

// Route for starting an election
router.post('/election/start', auth, async (req, res) => {
  try {
    await startElection(req, res);  // Call startElection with the request and response objects
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in /election/start route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route for updating election phase
router.post('/election/updatePhase', auth, async (req, res) => {
  try {
    await updateElectionPhase(req, res); // Call updateElectionPhase with the request and response objects
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error updating election phase:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
