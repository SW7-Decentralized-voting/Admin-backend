import express from 'express';
import { startElection } from '../controllers/election.js';
import { verifyToken } from '../utils/verifyToken.js';
import redisClient from '../utils/redisClient.js';

const router = express.Router();

// Route for starting an election with no arguments except a token
router.post('/start', async (req, res) => {
  const token = req.headers.authorization;
  try {
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  await startElection(req, res);

  const numKeys = req.body.numKeys;
  // TODO: Determine how many keys each voting location should have.
  await redisClient.publish('keyGeneration', JSON.stringify({ numKeys }));
} catch {
  return res.status(500).json({ error: 'Internal server error' });
}
});

// Receive Merkle tree and add to database?
router.post('/send-tree', async (req, res) => {
  const token = req.headers.authorization;
  try {
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const tree = req.body.tree;
  await redisClient.publish('sendTree', JSON.stringify({ tree }));
} catch {
  return res.status(500).json({ error: 'Internal server error' });
}
});

export default router;