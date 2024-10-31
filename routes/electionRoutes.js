import express from 'express';
import { startElection } from '../controllers/election.js';
import { auth } from '../middleware/verifyToken.js';

const router = express.Router();

// Route for starting an election with no arguments except a token
router.post('/start', auth, async (req, res) => {
  startElection(res);
});

export default router;