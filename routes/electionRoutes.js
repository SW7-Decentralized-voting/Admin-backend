import express from 'express';
import { startElection } from '../controllers/election.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Route for starting an election with no arguments except a token
router.post('/start', (req, res) => {
  const token = req.headers.authorization;
  try {
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  startElection(req, res);
} catch {
  return res.status(500).json({ error: 'Internal server error' });
}
});

export default router;