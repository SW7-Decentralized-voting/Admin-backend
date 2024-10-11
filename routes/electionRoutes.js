import express from 'express';
import { startElection } from '../controllers/election.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Route for starting an election with no arguments except a token
router.post('/', (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  startElection(req, res);
});

export default router;