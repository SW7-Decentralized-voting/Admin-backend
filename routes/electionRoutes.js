import express from 'express';
import { startElection } from '../controllers/election.js';
import { auth } from '../middleware/verifyToken.js';
import redisClient from '../utils/redisClient.js';

const router = express.Router();

// Route for starting an election with no arguments except a token
router.post('/start', auth, async (req, res) => {
  startElection(res);
});

// Receive Merkle tree and add to database?
router.post('/send-tree', auth, async (req, res) => {
  try {
    const tree = req.body.tree;
    await redisClient.publish('sendTree', JSON.stringify({ tree }));
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;